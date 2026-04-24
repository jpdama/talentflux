import { inferCountryAndRegion, inferRoleFamily, inferSeniorityBand, inferWorkplaceType, isAiRole, isGtmRole, extractSkills } from "@/lib/analytics/classify";
import type { CanonicalJob, CompanySeed } from "@/lib/types";
import { fetchJson } from "@/lib/utils/fetch";
import { hashContent } from "@/lib/utils/hash";

interface GreenhouseJobResponse {
  jobs: Array<{
    id: number;
    absolute_url: string;
    title: string;
    content?: string;
    location?: { name?: string };
    departments?: Array<{ name: string }>;
    offices?: Array<{ name?: string; location?: { name?: string } }>;
    updated_at?: string;
    metadata?: Array<{ name: string; value: string }>;
  }>;
}

export function parseGreenhouseJobs(company: CompanySeed, payload: GreenhouseJobResponse): CanonicalJob[] {
  return payload.jobs.map((job) => {
    const locationText = job.location?.name ?? job.offices?.[0]?.location?.name ?? job.offices?.[0]?.name ?? null;
    const department = job.departments?.[0]?.name ?? null;
    const descriptionText = job.content ?? "";
    const { country, region } = inferCountryAndRegion(locationText);

    return {
      companySlug: company.slug,
      companyName: company.name,
      provider: "greenhouse",
      providerJobId: String(job.id),
      sourceUrl: job.absolute_url,
      title: job.title,
      department,
      locationText,
      country,
      region,
      workplaceType: inferWorkplaceType(locationText),
      employmentType: "Full-time",
      roleFamily: inferRoleFamily(job.title, department),
      seniorityBand: inferSeniorityBand(job.title),
      isAiRole: isAiRole(job.title, department, descriptionText),
      isGtmRole: isGtmRole(job.title, department, descriptionText),
      skills: extractSkills(job.title, department, descriptionText),
      descriptionHash: hashContent(descriptionText || job.title),
      descriptionText,
      firstSeenAt: job.updated_at ?? new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      isOpen: true
    };
  });
}

export async function fetchGreenhouseJobs(company: CompanySeed) {
  const url = `https://boards-api.greenhouse.io/v1/boards/${company.providerToken}/jobs?content=true`;
  const payload = await fetchJson<GreenhouseJobResponse>(url, undefined, { retries: 2, timeoutMs: 12000 });
  return parseGreenhouseJobs(company, payload);
}
