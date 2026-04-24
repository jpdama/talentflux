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
  const featuredCompanies = snapshot.companies.slice(0, 6);
  const marketingStatus = snapshot.meta.usedFallback
    ? "Showing bundled sample data while live providers recover."
    : snapshot.meta.source === "database"
      ? "Persisted snapshot loaded from Neon."
      : "Live public job-board data loaded.";
  const operatingLenses = [
    {
      title: "Expansion monitoring",
      body: "Track which competitors are opening new regions, scaling GTM coverage, or building fresh leadership capacity before the broader market narrative catches up."
    },
    {
      title: "AI hiring pressure",
      body: "Separate generic engineering growth from deliberate AI and data investment so teams can see where product strategy is becoming talent strategy."
    },
    {
      title: "Weekly operating brief",
      body: "Roll raw openings, share shifts, and momentum changes into a readout that a founder, investor, or recruiter can use without cleaning a spreadsheet."
    }
  ];
  const workflow = [
    "Collect public Greenhouse and Lever postings across the cohort.",
    "Normalize role family, location, workplace type, and AI signal tags.",
    "Score momentum, detect alert conditions, and publish a live dashboard."
  ];

  return (
    <div className="pb-24">
      <section className="shell relative pt-16 md:pt-24">
        <div className="pointer-events-none absolute inset-x-4 top-8 h-64 rounded-[2rem] bg-gradient-to-r from-cyan-400/10 via-sky-400/10 to-orange-300/10 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="space-y-8">
            <Badge>TalentFlux // Public hiring intelligence</Badge>
            <div className="space-y-6">
              <h1 className="max-w-4xl text-5xl font-semibold leading-tight text-white md:text-7xl">
                Read the market while it is still hiring.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                TalentFlux tracks live hiring across software leaders, converts noisy postings into momentum scores,
                AI-share shifts, and expansion alerts, and gives strategy teams a sharper view of where competitors are
                actually investing.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/dashboard">Open signal desk</Link>
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
            <div className="flex flex-wrap gap-2">
              {featuredCompanies.map((company) => (
                <span
                  key={company.company.slug}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300"
                >
                  {company.company.name}
                </span>
              ))}
            </div>
          </div>

          <div className="panel-glow relative overflow-hidden p-6 md:p-7">
            <div className="absolute inset-0 bg-hero-grid opacity-90" />
            <div className="absolute -right-12 top-0 h-40 w-40 rounded-full bg-orange-300/10 blur-3xl" />
            <div className="relative space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs uppercase tracking-[0.22em] text-cyan-300">
                    Live signal desk
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold text-white">What operators can scan in under a minute</h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-slate-300">
                  {snapshot.meta.source}
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Market read</div>
                    <div className="mt-2 text-lg font-medium text-white">{snapshot.cohortSummary.headline}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-300">{snapshot.cohortSummary.watchItem}</div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {featuredCompanies.slice(0, 4).map((company) => (
                      <div key={company.company.slug} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-cyan-300">{company.company.sector}</div>
                        <div className="mt-2 text-base font-semibold text-white">{company.company.name}</div>
                        <div className="mt-3 text-sm text-slate-300">{company.metrics.openJobs} visible roles</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                          Momentum {Math.round(company.metrics.momentumScore)}
                        </div>
                      </div>
                    ))}
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
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                {marketingStatus}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell mt-24 space-y-8">
        <SectionHeading
          eyebrow="What TalentFlux Watches"
          title="Hiring data is one of the earliest public indicators of company intent."
          description="TalentFlux packages raw openings into an operating readout: where AI investment is accelerating, where GTM coverage is widening, and where leadership capacity is being added."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {operatingLenses.map((lens) => (
            <Card key={lens.title} className="space-y-3">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-300">{lens.title}</div>
              <p className="text-sm leading-7 text-slate-300">{lens.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="shell mt-24 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="space-y-6">
          <SectionHeading
            eyebrow="Expanded Cohort"
            title="A broader software market readout"
            description="The default tracking set now spans developer infrastructure, collaboration, CRM, cloud, and data-platform leaders."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {featuredCompanies.map((company) => (
              <div key={company.company.slug} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-white">{company.company.name}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                      {company.company.sector}
                    </div>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                    {company.metrics.openJobs} roles
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
                  <span>AI share {Math.round(company.metrics.aiShare * 100)}%</span>
                  <span>Momentum {Math.round(company.metrics.momentumScore)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div className="grid gap-6">
          <AiSummaryCard title="Cohort summary" summary={snapshot.cohortSummary} />
          <Card className="space-y-5">
            <SectionHeading
              eyebrow="Pipeline"
              title="How TalentFlux turns feeds into signal"
              description="Every output on the dashboard is grounded in deterministic collection, normalization, and scoring."
            />
            <div className="space-y-3">
              {workflow.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 font-mono text-xs text-cyan-200">
                    0{index + 1}
                  </div>
                  <p className="text-sm leading-6 text-slate-300">{step}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
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

      <section className="shell mt-24 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <CompanyLeaderboard companies={snapshot.companies.slice(0, 5)} />
        <div className="panel-glow relative overflow-hidden p-8 md:p-10">
          <div className="absolute inset-0 bg-hero-grid opacity-80" />
          <div className="relative space-y-6">
            <SectionHeading
              eyebrow="Launch"
              title="Use the landing page as the front door, not a placeholder."
              description="TalentFlux now opens with a real product narrative: live market stats, active alerts, cohort coverage, and a direct path into the dashboard."
            />
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/dashboard">Launch dashboard</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/methodology">See scoring logic</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
