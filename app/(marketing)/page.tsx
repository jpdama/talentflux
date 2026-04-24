import Link from "next/link";
import { ArrowRight, BarChart3, Radar, Sparkles, TrendingUp } from "lucide-react";

import { AlertCard } from "@/components/dashboard/alert-card";
import { CompanyLeaderboard } from "@/components/dashboard/company-leaderboard";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { loadCohortSnapshot } from "@/lib/analytics/snapshot";

export const revalidate = 900;

const OPERATING_LENSES = [
  {
    icon: Radar,
    title: "Expansion monitoring",
    body: "Track which competitors are opening new regions, scaling GTM coverage, or building fresh leadership before it hits the press."
  },
  {
    icon: Sparkles,
    title: "AI hiring pressure",
    body: "Separate generic engineering growth from deliberate AI and data investment — see where product strategy becomes talent strategy."
  },
  {
    icon: BarChart3,
    title: "Weekly operating brief",
    body: "Roll raw openings, share shifts, and momentum changes into a readout a founder or recruiter can use without cleaning spreadsheets."
  }
];

const WORKFLOW = [
  { step: "01", title: "Collect", body: "Pull public Greenhouse and Lever postings across the tracked cohort." },
  { step: "02", title: "Normalize", body: "Classify role family, seniority, workplace, and AI signal with deterministic rules." },
  { step: "03", title: "Score", body: "Compute momentum, detect alert conditions, and publish a grounded operating brief." }
];

export default async function MarketingPage() {
  const snapshot = await loadCohortSnapshot();
  const topAlerts = snapshot.alerts.slice(0, 3);
  const featuredCompanies = snapshot.companies.slice(0, 6);

  return (
    <div className="pb-24">
      {/* HERO */}
      <section className="shell relative overflow-hidden pt-16 md:pt-24">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-8 h-80 w-[80%] -translate-x-1/2 rounded-full bg-grid-fade blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <Badge variant="accent" dot className="mx-auto">
            Public hiring intelligence
          </Badge>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.05] text-foreground md:text-6xl">
            Read the market
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              while it's still hiring.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-strong md:text-lg">
            TalentFlux turns live public job boards into momentum scores, AI-share shifts, and expansion alerts so
            strategy teams see where competitors are actually investing — not where they say they are.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Open dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/methodology">How it works</Link>
            </Button>
          </div>
        </div>

        {/* KPI STRIP */}
        <div className="relative mx-auto mt-12 grid max-w-5xl gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">
          <KpiTile label="Tracked companies" value={String(snapshot.cohortMetrics.trackedCompanies)} />
          <KpiTile label="Open roles" value={snapshot.cohortMetrics.totalOpenJobs.toLocaleString()} />
          <KpiTile
            label="AI share"
            value={`${Math.round(snapshot.cohortMetrics.avgAiShare * 100)}%`}
            accent
          />
          <KpiTile label="Top momentum" value={snapshot.cohortMetrics.topMomentumCompany} compact />
        </div>
      </section>

      {/* OPERATING LENSES */}
      <section className="shell mt-24">
        <SectionHeading
          eyebrow="What we watch"
          title="Hiring data is the earliest public indicator of intent."
          description="TalentFlux packages raw openings into an operating readout: where AI investment is accelerating, where GTM coverage is widening, and where leadership capacity is being added."
          size="lg"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {OPERATING_LENSES.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="space-y-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{title}</h3>
              <p className="text-sm leading-6 text-muted-strong">{body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* LIVE PREVIEW */}
      <section className="shell mt-24 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <CompanyLeaderboard companies={snapshot.companies.slice(0, 5)} />
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Live alerts"
            title="Grounded signals, not vibes."
            description="Every alert is computed from metrics that pass explainable thresholds. The AI layer only summarizes — it never invents evidence."
            size="lg"
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {topAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      </section>

      {/* COHORT */}
      <section className="shell mt-24">
        <SectionHeading
          eyebrow="Cohort"
          title="A broader software market readout."
          description="Tracked companies span developer infrastructure, collaboration, CRM, cloud, and data-platform leaders."
          size="lg"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featuredCompanies.map((company) => (
            <Link
              key={company.company.slug}
              href={`/companies/${company.company.slug}`}
              className="surface group flex items-start justify-between gap-3 p-4 transition-colors hover:border-border-strong"
            >
              <div className="min-w-0 space-y-0.5">
                <div className="truncate text-sm font-semibold text-foreground">{company.company.name}</div>
                <div className="truncate text-xs text-muted">{company.company.sector}</div>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-strong">
                  <span className="numeric">{company.metrics.openJobs} roles</span>
                  <span>·</span>
                  <span className="numeric">AI {Math.round(company.metrics.aiShare * 100)}%</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="numeric inline-flex items-center gap-1 text-base font-semibold text-foreground">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  {Math.round(company.metrics.momentumScore)}
                </div>
                <div className="text-[10px] text-muted">Momentum</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="shell mt-24">
        <SectionHeading
          eyebrow="Pipeline"
          title="Deterministic from ingest to dashboard."
          description="No black-box scoring. Every output traces back to computed metrics and explainable rules."
          size="lg"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {WORKFLOW.map((item) => (
            <Card key={item.step} className="space-y-2">
              <div className="numeric font-mono text-xs text-primary">{item.step}</div>
              <div className="text-base font-semibold text-foreground">{item.title}</div>
              <p className="text-sm leading-6 text-muted-strong">{item.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="shell mt-24">
        <div className="surface relative overflow-hidden p-8 md:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
          />
          <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl space-y-3">
              <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
                Stop reading press releases. Start reading postings.
              </h2>
              <p className="text-sm leading-6 text-muted-strong md:text-base">
                Open the live signal desk to see momentum, AI-share, and expansion alerts across the tracked cohort.
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Launch dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/methodology">Read methodology</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function KpiTile({
  label,
  value,
  accent = false,
  compact = false
}: {
  label: string;
  value: string;
  accent?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="bg-surface px-5 py-5">
      <div className="text-xs font-medium text-muted">{label}</div>
      <div
        className={`numeric mt-2 font-semibold ${compact ? "text-xl" : "text-3xl"} ${
          accent ? "text-primary" : "text-foreground"
        } truncate`}
      >
        {value}
      </div>
    </div>
  );
}
