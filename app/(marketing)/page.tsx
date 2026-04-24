import Link from "next/link";

import { AiSummaryCard } from "@/components/dashboard/ai-summary-card";
import { AlertCard } from "@/components/dashboard/alert-card";
import { CompanyLeaderboard } from "@/components/dashboard/company-leaderboard";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { loadCohortSnapshot } from "@/lib/analytics/snapshot";

export const revalidate = 900;

export default async function MarketingPage() {
  const snapshot = await loadCohortSnapshot();
  const topAlerts = snapshot.alerts.slice(0, 3);

  return (
    <div className="pb-20">
      <section className="shell pt-16 md:pt-24">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-8">
            <Badge>Public competitor intelligence</Badge>
            <div className="space-y-6">
              <h1 className="max-w-4xl text-5xl font-semibold leading-tight text-white md:text-7xl">
                Turn public job boards into strategy signals before the quarter closes.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                TalentPulse tracks live hiring across AI/SaaS leaders, converts noisy postings into momentum scores and
                expansion alerts, and gives business teams a faster read on where competitors are investing.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/dashboard">Open live dashboard</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/methodology">Read methodology</Link>
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="p-5">
                <div className="text-sm text-slate-400">Tracked companies</div>
                <div className="mt-3 text-3xl font-semibold text-white">{snapshot.cohortMetrics.trackedCompanies}</div>
              </Card>
              <Card className="p-5">
                <div className="text-sm text-slate-400">Open roles</div>
                <div className="mt-3 text-3xl font-semibold text-white">{snapshot.cohortMetrics.totalOpenJobs}</div>
              </Card>
              <Card className="p-5">
                <div className="text-sm text-slate-400">AI share</div>
                <div className="mt-3 text-3xl font-semibold text-white">
                  {Math.round(snapshot.cohortMetrics.avgAiShare * 100)}%
                </div>
              </Card>
              <Card className="p-5">
                <div className="text-sm text-slate-400">Top momentum</div>
                <div className="mt-3 text-xl font-semibold text-white">{snapshot.cohortMetrics.topMomentumCompany}</div>
              </Card>
            </div>
          </div>

          <div className="panel-glow relative overflow-hidden p-6">
            <div className="absolute inset-0 bg-hero-grid opacity-90" />
            <div className="relative space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs uppercase tracking-[0.22em] text-cyan-300">
                    Live opportunity rail
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold text-white">What business users see in 30 seconds</h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-slate-300">
                  {snapshot.meta.source}
                </div>
              </div>
              <div className="grid gap-4">
                {topAlerts.map((alert) => (
                  <div key={alert.id} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-cyan-300">{alert.type}</div>
                    <div className="mt-2 text-lg font-medium text-white">{alert.title}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-300">{alert.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell mt-24 space-y-8">
        <SectionHeading
          eyebrow="Why it matters"
          title="Hiring data is one of the earliest public indicators of strategy."
          description="TalentPulse packages raw openings into decisions: where a competitor is pushing AI, where GTM coverage is widening, and where leadership capacity is being added."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="space-y-3">
            <div className="text-lg font-semibold text-white">For founders and product leaders</div>
            <p className="text-sm leading-7 text-slate-300">
              Spot adjacent expansion, track AI bets, and benchmark whether rivals are building more platform depth or
              more go-to-market muscle.
            </p>
          </Card>
          <Card className="space-y-3">
            <div className="text-lg font-semibold text-white">For recruiters and talent teams</div>
            <p className="text-sm leading-7 text-slate-300">
              Map hot skills, identify geographic hiring shifts, and understand which functions competitors are staffing
              most aggressively.
            </p>
          </Card>
          <Card className="space-y-3">
            <div className="text-lg font-semibold text-white">For investors and operators</div>
            <p className="text-sm leading-7 text-slate-300">
              Use hiring momentum as a fast, public proxy for commercial expansion, product investment, and operational
              focus.
            </p>
          </Card>
        </div>
      </section>

      <section className="shell mt-24 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <AiSummaryCard title="Cohort summary" summary={snapshot.cohortSummary} />
        <CompanyLeaderboard companies={snapshot.companies.slice(0, 5)} />
      </section>

      <section className="shell mt-24 space-y-8">
        <SectionHeading
          eyebrow="Top alerts"
          title="Signal cards that read like actual operating insight"
          description="Each alert is grounded in computed metrics and explainable rules, so the output stays useful even when the AI layer is disabled."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {topAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      </section>
    </div>
  );
}
