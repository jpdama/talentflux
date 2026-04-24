import { inferCountryAndRegion, inferRoleFamily, inferSeniorityBand, inferWorkplaceType, isAiRole, isGtmRole, extractSkills } from "@/lib/analytics/classify";
import type { CanonicalJob, CompanySeed } from "@/lib/types";
import { fetchJson } from "@/lib/utils/fetch";
import { hashContent } from "@/lib/utils/hash";

interface LeverPosting {
  id: string;
  text: string;
  description?: string;
  hostedUrl: string;
  categories?: {
    team?: string;
    department?: string;
    location?: string;
    commitment?: string;
    allLocations?: string[];
  };
  workplaceType?: string;
  createdAt?: number;
}

export function parseLeverJobs(company: CompanySeed, payload: LeverPosting[]): CanonicalJob[] {
  return payload.map((job) => {
    const department = job.categories?.team ?? job.categories?.department ?? null;
    const locationText = job.categories?.location ?? job.categories?.allLocations?.[0] ?? null;
    const descriptionText = job.description ?? "";
    const { country, region } = inferCountryAndRegion(locationText);

    return {
      companySlug: company.slug,
      companyName: company.name,
      provider: "lever",
      providerJobId: job.id,
      sourceUrl: job.hostedUrl,
      title: job.text,
      department,
      locationText,
      country,
      region,
      workplaceType: inferWorkplaceType(job.workplaceType ?? locationText),
      employmentType: job.categories?.commitment ?? "Full-time",
      roleFamily: inferRoleFamily(job.text, department),
      seniorityBand: inferSeniorityBand(job.text),
      isAiRole: isAiRole(job.text, department, descriptionText),
      isGtmRole: isGtmRole(job.text, department, descriptionText),
      skills: extractSkills(job.text, department, descriptionText),
      descriptionHash: hashContent(descriptionText || job.text),
      descriptionText,
      firstSeenAt: job.createdAt ? new Date(job.createdAt).toISOString() : new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      isOpen: true
    };
  });
}

export async function fetchLeverJobs(company: CompanySeed, signal?: AbortSignal) {
  const url = `https://api.lever.co/v0/postings/${company.providerToken}?mode=json`;
  const payload = await fetchJson<LeverPosting[]>(
    url,
    signal ? { signal } : undefined,
    { retries: 1, timeoutMs: 6000 }
  );
  return parseLeverJobs(company, payload);
}
