import Link from "next/link";

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
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { filtersFromSearchParams, loadCohortSnapshot } from "@/lib/analytics/snapshot";
import { companyConfig } from "@/lib/company-config";

export const revalidate = 900;

const DASHBOARD_SECTIONS = [
  {
    id: "overview",
    title: "Overview",
    description: "High-level trendline, leaderboard, and next-best reads."
  },
  {
    id: "signals",
    title: "Signals",
    description: "Function mix, AI intensity, location expansion, and explainable alerts."
  },
  {
    id: "jobs",
    title: "Jobs",
    description: "Role-level evidence and export-ready current openings."
  }
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
    <div className="shell space-y-8 py-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Badge>Interactive dashboard</Badge>
          <div>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">Competitor hiring intelligence</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
              Track where AI/SaaS leaders are adding headcount, compare function mix, and pull evidence-backed alerts
              from live or persisted public job-board data.
            </p>
          </div>
        </div>
        <LiveRefreshButton />
      </div>

      <FreshnessBanner meta={snapshot.meta} />

      <FilterBar
        filters={snapshot.filters}
        companies={companyConfig.map((company) => ({ slug: company.slug, name: company.name }))}
        locations={snapshot.availableLocations}
        roleFamilies={snapshot.availableRoleFamilies}
      />

      <div className="panel sticky top-4 z-10 p-3 backdrop-blur-xl">
        <div className="grid gap-3 lg:grid-cols-3">
          {DASHBOARD_SECTIONS.map((item) => {
            const active = item.id === section;
            return (
              <Link
                key={item.id}
                href={sectionHref(item.id) as never}
                scroll={false}
                className={`rounded-2xl border px-4 py-3 transition ${
                  active
                    ? "border-cyan-300/35 bg-cyan-300/12"
                    : "border-white/8 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.06]"
                }`}
              >
                <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-300">
                  {item.title}
                </div>
                <div className="mt-2 text-sm text-slate-300">{item.description}</div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Visible open roles"
          value={String(snapshot.cohortMetrics.totalOpenJobs)}
          delta={snapshot.cohortMetrics.netNew7d}
          detail="Current filtered roles across the tracked cohort."
        />
        <StatCard
          label="Average AI share"
          value={`${Math.round(snapshot.cohortMetrics.avgAiShare * 100)}%`}
          detail="Share of current openings classified as AI / Data."
        />
        <StatCard
          label="Average remote share"
          value={`${Math.round(snapshot.cohortMetrics.avgRemoteShare * 100)}%`}
          detail="Remote-only share across visible openings."
        />
        <StatCard
          label="Top momentum"
          value={snapshot.cohortMetrics.topMomentumCompany}
          detail="Highest momentum score in the filtered cohort."
        />
      </div>

      {section === "overview" ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <SectionHeading
                  eyebrow="Trend"
                  title="Open roles over time"
                  description="Historical or synthetic trendline depending on data freshness and source."
                />
              </div>
              <OpeningsTrendChart data={snapshot.cohortTrend} />
            </Card>
            <AiSummaryCard title="Cohort brief" summary={snapshot.cohortSummary} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <CompanyLeaderboard companies={snapshot.companies} />
            <Card className="space-y-4">
              <SectionHeading
                eyebrow="Focus"
                title="Where to drill next"
                description="Use the leaderboard to prioritize competitors, then open the detail page for evidence-backed drill-down."
              />
              <div className="grid gap-4 md:grid-cols-2">
                {snapshot.companies.slice(0, 4).map((company) => (
                  <Link
                    key={company.company.slug}
                    href={`/companies/${company.company.slug}`}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:border-cyan-300/25 hover:bg-white/[0.06]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-medium text-white">{company.company.name}</div>
                        <div className="mt-1 text-sm text-slate-400">{company.summary.watchItem}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-white">{company.metrics.momentumScore}</div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Momentum</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="rounded-2xl border border-white/8 bg-slate-950/50 p-4 text-sm leading-6 text-slate-300">
                <span className="font-medium text-white">Best demo path:</span> start with the trendline, switch to
                Signals for the alert logic, then finish in Jobs to show the evidence behind one competitor move.
              </div>
            </Card>
          </div>
        </>
      ) : null}

      {section === "signals" ? (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="space-y-4">
              <SectionHeading
                eyebrow="Mix"
                title="Function mix"
                description="Where visible hiring is concentrated right now."
              />
              <FunctionMixChart data={aggregatedFunctionMix} />
            </Card>
            <Card className="space-y-4">
              <SectionHeading
                eyebrow="AI intensity"
                title="AI share vs momentum"
                description="Bubble size reflects visible open roles."
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
                title="New locations in 30 days"
                description="A quick read on geographic expansion behavior."
              />
              <LocationGrowthChart
                data={snapshot.companies.map((company) => ({
                  name: company.company.name,
                  newLocationCount30d: company.metrics.newLocationCount30d
                }))}
              />
            </Card>
          </div>

          <section className="space-y-6">
            <div className="flex items-end justify-between gap-4">
              <SectionHeading
                eyebrow="Alerts"
                title="Top opportunities and risks"
                description="Explainable alert cards surface the companies that need attention first."
              />
              <Link href="/methodology" className="text-sm text-cyan-300 hover:text-cyan-200">
                See scoring rules
              </Link>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {snapshot.alerts.slice(0, 6).map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          </section>
        </>
      ) : null}

      {section === "jobs" ? (
        <Card className="space-y-4">
          <SectionHeading
            eyebrow="Role-level evidence"
            title="Current openings"
            description="Filter the table, export the visible slice, and use the detail pages when one company stands out."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {snapshot.companies.slice(0, 3).map((company) => (
              <Link
                key={company.company.slug}
                href={`/companies/${company.company.slug}`}
                className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:border-cyan-300/25 hover:bg-white/[0.06]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium text-white">{company.company.name}</div>
                    <div className="mt-1 text-sm text-slate-400">{company.metrics.openJobs} open roles</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-white">{company.metrics.momentumScore}</div>
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Momentum</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <JobsTable jobs={snapshot.jobs} />
        </Card>
      ) : null}
    </div>
  );
}
