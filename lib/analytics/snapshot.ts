import "server-only";

import { desc, eq, gte, isNotNull, or } from "drizzle-orm";

import { companies as companiesTable, companyDailyMetrics, insightSnapshots, jobsCurrent } from "@/db/schema";
import { getDb, hasDatabase } from "@/db/client";
import { deterministicSummary, buildCohortMetrics, buildCohortTrend, buildFunctionMix, finalizeHistory, topSkills } from "@/lib/analytics/metrics";
import { generateAlerts } from "@/lib/analytics/alerts";
import { companyConfig } from "@/lib/company-config";
import { buildSampleDataset } from "@/data/sample/sample-data";
import { fetchManyCompanies } from "@/lib/providers";
import type {
  CanonicalJob,
  CohortSnapshot,
  CompanySeed,
  DashboardFilters,
  DailyMetricPoint,
  GroundedSummary,
  Provider,
  RoleFamily
} from "@/lib/types";

type SummaryLookup = Record<string, GroundedSummary>;

function normalizeFilters(filters?: Partial<DashboardFilters>): DashboardFilters {
  return {
    companies: filters?.companies ?? [],
    roleFamily: filters?.roleFamily ?? "All",
    location: filters?.location,
    provider: filters?.provider ?? "all",
    remoteOnly: filters?.remoteOnly ?? false,
    aiOnly: filters?.aiOnly ?? false,
    timeRangeDays: filters?.timeRangeDays ?? 30
  };
}

function matchJob(job: CanonicalJob, filters: DashboardFilters) {
  if (filters.companies.length && !filters.companies.includes(job.companySlug)) return false;
  if (filters.provider !== "all" && job.provider !== filters.provider) return false;
  if (filters.roleFamily && filters.roleFamily !== "All" && job.roleFamily !== filters.roleFamily) return false;
  if (filters.location && job.locationText !== filters.location && job.region !== filters.location) return false;
  if (filters.remoteOnly && job.workplaceType !== "remote") return false;
  if (filters.aiOnly && !job.isAiRole) return false;
  return true;
}

function buildSummaryLookup(
  rawSnapshots: Array<{ companyId: string | null; summaryKind: string; summaryJson: unknown }>,
  idToSlug: Record<string, string>
) {
  return rawSnapshots.reduce<SummaryLookup>((accumulator, snapshot) => {
    if (snapshot.summaryKind !== "company" || !snapshot.companyId) {
      return accumulator;
    }

    const slug = idToSlug[snapshot.companyId];
    if (!slug) return accumulator;
    accumulator[slug] = snapshot.summaryJson as GroundedSummary;
    return accumulator;
  }, {});
}

function useStoredSummary(filters: DashboardFilters) {
  return filters.roleFamily === "All" && !filters.location && !filters.remoteOnly && !filters.aiOnly;
}

function buildLiveNotices(errors: Array<{ companySlug: string; error: string }>) {
  if (!errors.length) {
    return ["Loaded live public job-board data."];
  }

  const unavailableCompanies = errors
    .map((error) => companyConfig.find((company) => company.slug === error.companySlug)?.name ?? error.companySlug)
    .slice(0, 3);
  const overflowCount = errors.length - unavailableCompanies.length;
  const unavailableLabel = overflowCount > 0
    ? `${unavailableCompanies.join(", ")} + ${overflowCount} more`
    : unavailableCompanies.join(", ");

  return [
    `Loaded live public job-board data with ${errors.length} provider ${errors.length === 1 ? "issue" : "issues"}.`,
    `Unavailable during the latest refresh: ${unavailableLabel}.`
  ];
}

function buildCompanyView(
  company: CompanySeed,
  jobs: CanonicalJob[],
  history: DailyMetricPoint[],
  storedSummary: GroundedSummary | undefined,
  allowStoredSummary: boolean
) {
  const { history: finalizedHistory, current, functionMix } = finalizeHistory(company, jobs, history);
  const alerts = generateAlerts(company, current, finalizedHistory, functionMix);
  const skills = topSkills(jobs);
  const summary = storedSummary && allowStoredSummary
    ? storedSummary
    : deterministicSummary(company.name, current, alerts.map((alert) => alert.title), functionMix, skills);

  return {
    company,
    metrics: current,
    history: finalizedHistory,
    jobs: jobs.filter((job) => job.isOpen).sort((left, right) => right.firstSeenAt.localeCompare(left.firstSeenAt)),
    alerts,
    summary,
    functionMix,
    topSkills: skills
  };
}

function buildSnapshotFromRecords(
  companies: CompanySeed[],
  jobs: CanonicalJob[],
  history: DailyMetricPoint[],
  storedSummaries: SummaryLookup,
  filters?: Partial<DashboardFilters>,
  meta?: CohortSnapshot["meta"]
): CohortSnapshot {
  const normalizedFilters = normalizeFilters(filters);
  const filteredJobs = jobs.filter((job) => matchJob(job, normalizedFilters));
  const allowStoredSummary = useStoredSummary(normalizedFilters);
  const selectedCompanies = companies.filter((company) =>
    normalizedFilters.companies.length ? normalizedFilters.companies.includes(company.slug) : true
  );

  const companyViews = selectedCompanies
    .map((company) => {
      const companyJobs = filteredJobs.filter((job) => job.companySlug === company.slug);
      const companyHistory = history.filter((point) => point.companySlug === company.slug);
      return buildCompanyView(
        company,
        companyJobs,
        companyHistory,
        storedSummaries[company.slug],
        allowStoredSummary
      );
    })
    .filter((view) => view.jobs.length > 0 || normalizedFilters.companies.includes(view.company.slug));

  const cohortMetrics = buildCohortMetrics(companyViews);
  const cohortTrend = buildCohortTrend(companyViews.map((view) => view.history)).slice(-normalizedFilters.timeRangeDays);
  const availableLocations = [...new Set(jobs.map((job) => job.locationText ?? job.region).filter(Boolean))].sort() as string[];
  const availableRoleFamilies = [...new Set(jobs.map((job) => job.roleFamily))].sort() as RoleFamily[];
  const allAlerts = companyViews.flatMap((view) => view.alerts).sort((left, right) => left.title.localeCompare(right.title));
  const cohortSummary = deterministicSummary(
    "The tracked cohort",
    {
      companySlug: "cohort",
      metricDate: cohortTrend.at(-1)?.metricDate ?? new Date().toISOString().slice(0, 10),
      openJobs: cohortMetrics.totalOpenJobs,
      newJobs7d: companyViews.reduce((sum, view) => sum + view.metrics.newJobs7d, 0),
      closedJobs7d: companyViews.reduce((sum, view) => sum + view.metrics.closedJobs7d, 0),
      netNew7d: cohortMetrics.netNew7d,
      aiShare: cohortMetrics.avgAiShare,
      gtmShare: Number(
        (companyViews.reduce((sum, view) => sum + view.metrics.gtmShare, 0) / Math.max(companyViews.length, 1)).toFixed(4)
      ),
      leadershipShare: Number(
        (
          companyViews.reduce((sum, view) => sum + view.metrics.leadershipShare, 0) /
          Math.max(companyViews.length, 1)
        ).toFixed(4)
      ),
      remoteShare: cohortMetrics.avgRemoteShare,
      locationCount: availableLocations.length,
      newLocationCount30d: companyViews.reduce((sum, view) => sum + view.metrics.newLocationCount30d, 0),
      momentumScore: Number(
        (
          companyViews.reduce((sum, view) => sum + view.metrics.momentumScore, 0) /
          Math.max(companyViews.length, 1)
        ).toFixed(2)
      ),
      forecast7d: cohortTrend.at(-1)?.openJobs ?? cohortMetrics.totalOpenJobs
    },
    allAlerts.slice(0, 3).map((alert) => alert.title),
    buildFunctionMix(filteredJobs.filter((job) => job.isOpen)),
    [...new Set(filteredJobs.flatMap((job) => job.skills))].slice(0, 5)
  );

  return {
    meta:
      meta ?? {
        source: "sample",
        generatedAt: new Date().toISOString(),
        freshnessMinutes: 0,
        usedFallback: true,
        notices: ["Showing bundled sample data."]
      },
    filters: normalizedFilters,
    cohortMetrics,
    cohortTrend,
    companies: companyViews.sort((left, right) => right.metrics.momentumScore - left.metrics.momentumScore),
    alerts: allAlerts,
    jobs: filteredJobs.filter((job) => job.isOpen),
    availableLocations,
    availableRoleFamilies,
    availableProviders: ["greenhouse", "lever"],
    cohortSummary
  };
}

async function loadDatabaseRecords() {
  if (!hasDatabase()) {
    return null;
  }

  try {
    const db = getDb();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 45);

    const [companyRows, jobRows, historyRows, summaryRows] = await Promise.all([
      db.select().from(companiesTable).where(eq(companiesTable.isActive, true)),
      db
        .select()
        .from(jobsCurrent)
        .where(or(eq(jobsCurrent.isOpen, true), gte(jobsCurrent.lastSeenAt, cutoff))),
      db.select().from(companyDailyMetrics).where(gte(companyDailyMetrics.metricDate, cutoff.toISOString().slice(0, 10))),
      db
        .select({
          companyId: insightSnapshots.companyId,
          summaryKind: insightSnapshots.summaryKind,
          summaryJson: insightSnapshots.summaryJson
        })
        .from(insightSnapshots)
        .where(isNotNull(insightSnapshots.companyId))
        .orderBy(desc(insightSnapshots.generatedAt))
    ]);

    if (!jobRows.length) {
      return null;
    }

    const companies = companyRows.map((row) => ({
      slug: row.slug,
      name: row.name,
      provider: row.provider as Provider,
      providerToken: row.providerToken,
      websiteUrl: row.websiteUrl,
      careersUrl: row.careersUrl,
      sector: row.sector,
      isActive: row.isActive
    }));

    const companyById = Object.fromEntries(companyRows.map((row) => [row.id, row]));
    const idToSlug = Object.fromEntries(companyRows.map((row) => [row.id, row.slug]));
    const jobs: CanonicalJob[] = jobRows.map((row) => ({
      companySlug: companyById[row.companyId].slug,
      companyName: companyById[row.companyId].name,
      provider: companyById[row.companyId].provider as Provider,
      providerJobId: row.providerJobId,
      sourceUrl: row.sourceUrl,
      title: row.title,
      department: row.department,
      locationText: row.locationText,
      country: row.country,
      region: row.region,
      workplaceType: (row.workplaceType ?? "unknown") as CanonicalJob["workplaceType"],
      employmentType: row.employmentType,
      roleFamily: row.roleFamily as CanonicalJob["roleFamily"],
      seniorityBand: row.seniorityBand as CanonicalJob["seniorityBand"],
      isAiRole: row.isAiRole,
      isGtmRole: row.isGtmRole,
      skills: row.skills as string[],
      descriptionHash: row.descriptionHash,
      descriptionText: row.descriptionText ?? "",
      firstSeenAt: row.firstSeenAt.toISOString(),
      lastSeenAt: row.lastSeenAt.toISOString(),
      isOpen: row.isOpen
    }));

    const history: DailyMetricPoint[] = historyRows.map((row) => ({
      companySlug: companyById[row.companyId].slug,
      metricDate: row.metricDate,
      openJobs: row.openJobs,
      newJobs7d: row.newJobs7d,
      closedJobs7d: row.closedJobs7d,
      netNew7d: row.netNew7d,
      aiShare: Number(row.aiShare),
      gtmShare: Number(row.gtmShare),
      leadershipShare: Number(row.leadershipShare),
      remoteShare: Number(row.remoteShare),
      locationCount: row.locationCount,
      newLocationCount30d: row.newLocationCount30d,
      momentumScore: Number(row.momentumScore),
      forecast7d: row.forecast7d
    }));

    const generatedAt = history.at(-1)?.metricDate ? `${history.at(-1)!.metricDate}T00:00:00.000Z` : new Date().toISOString();

    return {
      companies,
      jobs,
      history,
      summaries: buildSummaryLookup(
        summaryRows.map((row) => ({
          companyId: row.companyId,
          summaryKind: row.summaryKind,
          summaryJson: row.summaryJson
        })),
        idToSlug
      ),
      meta: {
        source: "database" as const,
        generatedAt,
        freshnessMinutes: 0,
        usedFallback: false,
        notices: ["Loaded persisted snapshot history from Postgres."]
      }
    };
  } catch {
    return null;
  }
}

async function loadLiveRecords() {
  const { jobs, errors } = await fetchManyCompanies(companyConfig.filter((company) => company.isActive));
  if (!jobs.length) return null;

  return {
    companies: companyConfig,
    jobs,
    history: [],
    summaries: {},
    meta: {
      source: "live" as const,
      generatedAt: new Date().toISOString(),
      freshnessMinutes: 0,
      usedFallback: false,
      notices: buildLiveNotices(errors)
    }
  };
}

export async function loadCohortSnapshot(filters?: Partial<DashboardFilters>) {
  const databaseData = await loadDatabaseRecords();
  if (databaseData) {
    return buildSnapshotFromRecords(
      databaseData.companies,
      databaseData.jobs,
      databaseData.history,
      databaseData.summaries,
      filters,
      databaseData.meta
    );
  }

  try {
    const liveData = await loadLiveRecords();
    if (liveData) {
      return buildSnapshotFromRecords(
        liveData.companies,
        liveData.jobs,
        liveData.history,
        liveData.summaries,
        filters,
        liveData.meta
      );
    }
  } catch {
    // Fall through to bundled sample data.
  }

  const sample = buildSampleDataset();
  return buildSnapshotFromRecords(sample.companies, sample.jobs, sample.history, {}, filters, {
    source: "sample",
    generatedAt: new Date().toISOString(),
    freshnessMinutes: 0,
    usedFallback: true,
    notices: ["Live providers were unavailable. Showing bundled sample data."]
  });
}

export async function loadCompanySnapshot(slug: string, filters?: Partial<DashboardFilters>) {
  const snapshot = await loadCohortSnapshot({
    ...filters,
    companies: [slug]
  });

  return snapshot.companies[0] ?? null;
}

export function filtersFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): Partial<DashboardFilters> {
  const companiesParam = searchParams.companies;
  const companies =
    typeof companiesParam === "string"
      ? companiesParam.split(",").filter(Boolean)
      : Array.isArray(companiesParam)
        ? companiesParam
        : [];

  return {
    companies,
    roleFamily:
      typeof searchParams.roleFamily === "string" && searchParams.roleFamily !== "All"
        ? (searchParams.roleFamily as RoleFamily)
        : "All",
    location: typeof searchParams.location === "string" ? searchParams.location : undefined,
    provider:
      typeof searchParams.provider === "string"
        ? (searchParams.provider as Provider | "all")
        : "all",
    remoteOnly: searchParams.remoteOnly === "true",
    aiOnly: searchParams.aiOnly === "true",
    timeRangeDays:
      typeof searchParams.timeRange === "string" ? Number(searchParams.timeRange) || 30 : 30
  };
}
