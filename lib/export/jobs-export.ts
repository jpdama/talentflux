import type { DashboardFilters } from "@/lib/types";
import { toCsv } from "@/lib/utils/csv";
import { loadCohortSnapshot } from "@/lib/analytics/snapshot";

export async function buildJobsCsv(filters: Partial<DashboardFilters>) {
  const snapshot = await loadCohortSnapshot(filters);
  const rows = snapshot.jobs.map((job) => ({
    company: job.companyName,
    title: job.title,
    roleFamily: job.roleFamily,
    location: job.locationText ?? "",
    workplaceType: job.workplaceType,
    provider: job.provider,
    aiRole: job.isAiRole ? "Yes" : "No",
    gtmRole: job.isGtmRole ? "Yes" : "No",
    firstSeenAt: job.firstSeenAt,
    sourceUrl: job.sourceUrl
  }));
  return toCsv(rows);
}
