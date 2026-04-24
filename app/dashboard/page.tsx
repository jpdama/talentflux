import Link from "next/link";
import { ArrowRight, BarChart3, Briefcase, Gauge } from "lucide-react";

import { AiHiringScatter } from "@/components/charts/ai-hiring-scatter";
import { FunctionMixChart } from "@/components/charts/function-mix-chart";
import { LocationGrowthChart } from "@/components/charts/location-growth-chart";
import { OpeningsTrendChart } from "@/components/charts/openings-trend-chart";
import { AiSummaryCard } from "@/components/dashboard/ai-summary-card";
import { AlertCard } from "@/components/dashboard/alert-card";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { FreshnessBanner } from "@/components/dashboard/freshness-banner";
import { JobsTable } from "@/components/dashboard/jobs-table";
import { LiveRefreshButton } from "@/components/dashboard/live-refresh-button";
import { StatCard } from "@/components/dashboard/stat-card";
import { CompanyLeaderboard } from "@/components/dashboard/company-leaderboard";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils/cn";
import { filtersFromSearchParams, loadCohortSnapshot } from "@/lib/analytics/snapshot";
import { companyConfig } from "@/lib/company-config";

export const revalidate = 900;

const DASHBOARD_SECTIONS = [
  { id: "overview", label: "Overview", icon: Gauge },
  { id: "signals", label: "Signals", icon: BarChart3 },
  { id: "jobs", label: "Jobs", icon: Briefcase }
] as const;

type DashboardSection = (typeof DASHBOARD_SECTIONS)[number]["id"];

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const snapshot = await loadCohortSnapshot(filtersFromSearchParams(resolvedSearchParams));
  const section =
    typeof resolvedSearchParams.section === "string" &&
    DASHBOARD_SECTIONS.some((item) => item.id === resolvedSearchParams.section)
      ? (resolvedSearchParams.section as DashboardSection)
      : "overview";

  const aggregatedFunctionMix = Object.values(
    snapshot.companies
      .flatMap((company) => company.functionMix)
      .reduce<Record<string, { roleFamily: string; count: number; share: number }>>((accumulator, item) => {
        accumulator[item.roleFamily] = accumulator[item.roleFamily] ?? {
          roleFamily: item.roleFamily,
          count: 0,
          share: 0
        };
        accumulator[item.roleFamily].count += item.count;
        accumulator[item.roleFamily].share += item.share;
        return accumulator;
      }, {})
  )
    .sort((left, right) => right.count - left.count)
    .slice(0, 6);

  const sectionParams = new URLSearchParams();
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => sectionParams.append(key, entry));
      return;
    }
    if (typeof value === "string") {
      sectionParams.set(key, value);
    }
  });

  function sectionHref(nextSection: DashboardSection) {
    const params = new URLSearchParams(sectionParams.toString());
    params.set("section", nextSection);
    return `/dashboard?${params.toString()}`;
  }

  return (
    <div className="shell space-y-6 py-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1.5">
          <div className="eyebrow">Live dashboard</div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Competitor hiring intelligence
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-strong">
            Track where AI and software leaders are adding headcount, compare function mix, and pull evidence-backed
            alerts from live or persisted public job-board data.
          </p>
        </div>
        <LiveRefreshButton />
      </div>

      <FreshnessBanner meta={snapshot.meta} />

      {/* STATS */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Visible open roles"
          value={snapshot.cohortMetrics.totalOpenJobs.toLocaleString()}
          delta={snapshot.cohortMetrics.netNew7d}
          detail="Current filtered roles across the tracked cohort."
        />
        <StatCard
          label="Avg AI share"
          value={`${Math.round(snapshot.cohortMetrics.avgAiShare * 100)}%`}
          detail="Share of current openings classified as AI or Data."
        />
        <StatCard
          label="Avg remote share"
          value={`${Math.round(snapshot.cohortMetrics.avgRemoteShare * 100)}%`}
          detail="Remote-only share across visible openings."
        />
        <StatCard
          label="Top momentum"
          value={snapshot.cohortMetrics.topMomentumCompany}
          detail="Highest momentum score in the filtered cohort."
        />
      </div>

      {/* FILTERS */}
      <FilterBar
        filters={snapshot.filters}
        companies={companyConfig.map((company) => ({ slug: company.slug, name: company.name }))}
        locations={snapshot.availableLocations}
        roleFamilies={snapshot.availableRoleFamilies}
      />

      {/* TABS */}
      <nav
        aria-label="Dashboard sections"
        className="sticky top-14 z-20 -mx-4 border-b border-border bg-background/90 px-4 backdrop-blur-xl md:-mx-6 md:px-6 lg:-mx-8 lg:px-8"
      >
        <div className="flex gap-1 overflow-x-auto nice-scroll">
          {DASHBOARD_SECTIONS.map((item) => {
            const active = item.id === section;
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={sectionHref(item.id) as never}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex items-center gap-2 whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors",
                  active ? "text-foreground" : "text-muted hover:text-muted-strong"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {active ? (
                  <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 rounded-full bg-primary" />
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* SECTION CONTENT */}
      {section === "overview" ? (
        <>
          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <Card className="space-y-4">
              <SectionHeading
                eyebrow="Trend"
                title="Open roles over time"
                description="Historical or synthetic trendline depending on source."
                size="md"
              />
              <OpeningsTrendChart data={snapshot.cohortTrend} />
            </Card>
            <AiSummaryCard title="Cohort brief" summary={snapshot.cohortSummary} />
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <CompanyLeaderboard companies={snapshot.companies} />
            <Card className="space-y-4">
              <SectionHeading
                eyebrow="Drill"
                title="Where to look next"
                description="Open a company detail page to see evidence-backed alerts and role-level postings."
                size="md"
              />
              <div className="grid gap-2 md:grid-cols-2">
                {snapshot.companies.slice(0, 4).map((company) => (
                  <Link
                    key={company.company.slug}
                    href={`/companies/${company.company.slug}`}
                    className="group flex items-start justify-between gap-3 rounded-lg border border-border bg-surface-raised/60 p-3 transition-colors hover:border-border-strong"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="truncate text-sm font-medium text-foreground">{company.company.name}</div>
                      <div className="line-clamp-2 text-xs leading-5 text-muted">{company.summary.watchItem}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="numeric text-base font-semibold text-foreground">
                        {Math.round(company.metrics.momentumScore)}
                      </div>
                      <div className="text-[10px] text-muted">Momentum</div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href={sectionHref("signals") as never}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
              >
                Explore signals
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Card>
          </div>
        </>
      ) : null}

      {section === "signals" ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="space-y-4">
              <SectionHeading
                eyebrow="Mix"
                title="Function mix"
                description="Where hiring is concentrated right now."
                size="md"
              />
              <FunctionMixChart data={aggregatedFunctionMix} />
            </Card>
            <Card className="space-y-4">
              <SectionHeading
                eyebrow="AI intensity"
                title="AI share vs momentum"
                description="Bubble size = open roles."
                size="md"
              />
              <AiHiringScatter
                data={snapshot.companies.map((company) => ({
                  name: company.company.name,
                  aiShare: company.metrics.aiShare,
                  momentumScore: company.metrics.momentumScore,
                  openJobs: company.metrics.openJobs
                }))}
              />
            </Card>
            <Card className="space-y-4">
              <SectionHeading
                eyebrow="Expansion"
                title="New locations (30d)"
                description="Geographic expansion signal."
                size="md"
              />
              <LocationGrowthChart
                data={snapshot.companies.map((company) => ({
                  name: company.company.name,
                  newLocationCount30d: company.metrics.newLocationCount30d
                }))}
              />
            </Card>
          </div>

          <section className="space-y-4">
            <SectionHeading
              eyebrow="Alerts"
              title="Top opportunities and risks"
              description="Explainable alerts surface the companies that need attention first."
              size="md"
              action={
                <Link
                  href="/methodology"
                  className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Scoring rules →
                </Link>
              }
            />
            {snapshot.alerts.length === 0 ? (
              <Card className="text-center text-sm text-muted">No alerts triggered for the current filter set.</Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {snapshot.alerts.slice(0, 6).map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}

      {section === "jobs" ? (
        <Card className="space-y-4">
          <SectionHeading
            eyebrow="Openings"
            title="Current postings"
            description="Role-level evidence. Filter, search, or export."
            size="md"
          />
          <JobsTable jobs={snapshot.jobs} />
        </Card>
      ) : null}
    </div>
  );
}
