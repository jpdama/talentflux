import { notFound } from "next/navigation";

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

  return (
    <div className="shell space-y-8 py-10">
      <div className="space-y-5">
        <Badge>{company.company.sector}</Badge>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">{company.company.name}</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
              Drill into current openings, role mix, alert logic, and grounded summary output for this company.
            </p>
          </div>
          <a
            href={company.jobs[0]?.sourceUrl ?? company.company.careersUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Open careers page
          </a>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Open roles"
          value={String(company.metrics.openJobs)}
          delta={company.metrics.netNew7d}
          detail="Current visible openings in the filtered view."
        />
        <StatCard
          label="AI share"
          value={`${Math.round(company.metrics.aiShare * 100)}%`}
          detail="AI or data roles as a share of current openings."
        />
        <StatCard
          label="Remote share"
          value={`${Math.round(company.metrics.remoteShare * 100)}%`}
          detail="Remote-only share of visible hiring."
        />
        <StatCard
          label="Forecast (7d)"
          value={String(company.metrics.forecast7d)}
          detail="Simple linear projection of open role count."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-4">
          <SectionHeading
            eyebrow="Trend"
            title={`${company.company.name} hiring timeline`}
            description="Shows how visible role count has moved across the current history window."
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

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-4 lg:col-span-1">
          <SectionHeading
            eyebrow="Role concentration"
            title="Function split"
            description="The current hiring portfolio by business function."
          />
          <FunctionMixChart data={company.functionMix} />
        </Card>
        <Card className="space-y-4 lg:col-span-2">
          <SectionHeading
            eyebrow="Skill demand"
            title="Top visible skills"
            description="Keyword extraction from current role titles and descriptions."
          />
          <div className="flex flex-wrap gap-3">
            {company.topSkills.map((skill) => (
              <span key={skill} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                {skill}
              </span>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {company.alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <JobsTable jobs={company.jobs} />
      </Card>
    </div>
  );
}
