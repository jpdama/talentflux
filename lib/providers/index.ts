import pLimit from "p-limit";

import type { CanonicalJob, CompanySeed } from "@/lib/types";
import { fetchGreenhouseJobs } from "@/lib/providers/greenhouse";
import { fetchLeverJobs } from "@/lib/providers/lever";

export async function fetchCompanyJobs(company: CompanySeed): Promise<CanonicalJob[]> {
  if (company.provider === "greenhouse") {
    return fetchGreenhouseJobs(company);
  }

  return fetchLeverJobs(company);
}

export async function fetchManyCompanies(companies: CompanySeed[]) {
  const limit = pLimit(2);
  const results = await Promise.allSettled(
    companies.map((company) =>
      limit(async () => ({
        company,
        jobs: await fetchCompanyJobs(company)
      }))
    )
  );

  const jobs: CanonicalJob[] = [];
  const errors: Array<{ companySlug: string; error: string }> = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      jobs.push(...result.value.jobs);
    } else {
      errors.push({
        companySlug: companies[index].slug,
        error: result.reason instanceof Error ? result.reason.message : "Unknown provider error"
      });
    }
  });

  return { jobs, errors };
}
