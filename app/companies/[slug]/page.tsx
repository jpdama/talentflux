import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { FunctionMixChart } from "@/components/charts/function-mix-chart";
import { OpeningsTrendChart } from "@/components/charts/openings-trend-chart";
import { AiSummaryCard } from "@/components/dashboard/ai-summary-card";
import { AlertCard } from "@/components/dashboard/alert-card";
import { JobsTable } from "@/components/dashboard/jobs-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { loadCompanySnapshot } from "@/lib/analytics/snapshot";

export const revalidate = 900;

export default async function CompanyPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await loadCompanySnapshot(slug);

  if (!company) {
    notFound();
  }

  const careersUrl = company.jobs[0]?.sourceUrl ?? company.company.careersUrl;

  return (
    <div className="shell space-y-6 py-8">
      {/* BACK */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to dashboard
      </Link>

      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="accent">{company.company.sector}</Badge>
            <Badge variant="outline">{company.company.provider}</Badge>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {company.company.name}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-strong">
            Current openings, role mix, alert logic, and grounded summary for {company.company.name}.
          </p>
        </div>
        <a
          href={careersUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface-raised px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-muted/40"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Careers page
        </a>
      </div>

      {/* STATS */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Open roles"
          value={String(company.metrics.openJobs)}
          delta={company.metrics.netNew7d}
          detail="Current visible openings."
        />
        <StatCard
          label="AI share"
          value={`${Math.round(company.metrics.aiShare * 100)}%`}
          detail="AI or data roles as share of openings."
        />
        <StatCard
          label="Remote share"
          value={`${Math.round(company.metrics.remoteShare * 100)}%`}
          detail="Remote-only share of hiring."
        />
        <StatCard
          label="Forecast (7d)"
          value={String(company.metrics.forecast7d)}
          detail="Linear projection of open role count."
        />
      </div>

      {/* TREND + AI */}
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-4">
          <SectionHeading
            eyebrow="Trend"
            title="Hiring timeline"
            description="Visible role count across the history window."
            size="md"
          />
          <OpeningsTrendChart
            data={company.history.map((point) => ({
              metricDate: point.metricDate,
              openJobs: point.openJobs,
              aiShare: point.aiShare
            }))}
          />
        </Card>
        <AiSummaryCard title={`${company.company.name} brief`} summary={company.summary} />
      </div>

      {/* MIX + SKILLS + ALERTS */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4">
          <SectionHeading
            eyebrow="Mix"
            title="Function split"
            description="Current hiring portfolio by function."
            size="md"
          />
          <FunctionMixChart data={company.functionMix} />
        </Card>
        <Card className="space-y-4">
          <SectionHeading
            eyebrow="Skills"
            title="Top visible skills"
            description="Keyword extraction from role titles and descriptions."
            size="md"
          />
          {company.topSkills.length === 0 ? (
            <div className="text-sm text-muted">No skill keywords extracted yet.</div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {company.topSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-full border border-border bg-surface-raised px-2.5 py-1 text-xs text-muted-strong"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </Card>
      </div>

      {company.alerts.length > 0 ? (
        <section className="space-y-4">
          <SectionHeading
            eyebrow="Alerts"
            title="What's firing"
            description="Computed thresholds triggered for this company."
            size="md"
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {company.alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </section>
      ) : null}

      <Card padding="md">
        <JobsTable jobs={company.jobs} />
      </Card>
    </div>
  );
}
