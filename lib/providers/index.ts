import pLimit from "p-limit";

import type { CanonicalJob, CompanySeed } from "@/lib/types";
import { fetchGreenhouseJobs } from "@/lib/providers/greenhouse";
import { fetchLeverJobs } from "@/lib/providers/lever";

const DEFAULT_OVERALL_BUDGET_MS = 12_000;

export async function fetchCompanyJobs(company: CompanySeed, signal?: AbortSignal): Promise<CanonicalJob[]> {
  if (company.provider === "greenhouse") {
    return fetchGreenhouseJobs(company, signal);
  }

  return fetchLeverJobs(company, signal);
}

export async function fetchManyCompanies(
  companies: CompanySeed[],
  options?: { budgetMs?: number; concurrency?: number }
) {
  const budgetMs = options?.budgetMs ?? DEFAULT_OVERALL_BUDGET_MS;
  const concurrency = options?.concurrency ?? 4;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), budgetMs);

  const limit = pLimit(concurrency);
  const results = await Promise.allSettled(
    companies.map((company) =>
      limit(async () => ({
        company,
        jobs: await fetchCompanyJobs(company, controller.signal)
      }))
    )
  );
  clearTimeout(timeout);

  const jobs: CanonicalJob[] = [];
  const errors: Array<{ companySlug: string; error: string }> = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      jobs.push(...result.value.jobs);
      return;
    }

    const reason = result.reason;
    const message =
      reason instanceof Error
        ? reason.name === "AbortError"
          ? `Provider timeout exceeded budget (${budgetMs}ms)`
          : reason.message
        : "Unknown provider error";
    errors.push({ companySlug: companies[index].slug, error: message });
  });

  return { jobs, errors, budgetExceeded: controller.signal.aborted };
}
