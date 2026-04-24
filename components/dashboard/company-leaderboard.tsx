import Link from "next/link";
import { ChevronRight, TrendingUp } from "lucide-react";

import { CompanySparkline } from "@/components/charts/company-sparkline";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import type { CompanySnapshot } from "@/lib/types";

export function CompanyLeaderboard({ companies }: { companies: CompanySnapshot[] }) {
  return (
    <Card className="space-y-4">
      <SectionHeading
        eyebrow="Leaderboard"
        title="Momentum ranking"
        description="Highest-signal companies in the filtered cohort."
        size="md"
      />
      <div className="divide-y divide-border rounded-lg border border-border">
        {companies.map((company, index) => (
          <Link
            key={company.company.slug}
            href={`/companies/${company.company.slug}`}
            className="group flex items-center gap-4 px-3 py-3 transition-colors hover:bg-surface-raised/60"
          >
            <div className="numeric flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-raised text-xs font-semibold text-muted-strong">
              {index + 1}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-foreground">{company.company.name}</div>
              <div className="truncate text-xs text-muted">{company.company.sector}</div>
            </div>
            <div className="hidden md:block">
              <CompanySparkline data={company.history} />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="numeric inline-flex items-center gap-1 text-base font-semibold text-foreground">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  {Math.round(company.metrics.momentumScore)}
                </div>
                <div className="text-[11px] text-muted">
                  {company.metrics.openJobs} open
                </div>
              </div>
              <ChevronRight
                className="h-4 w-4 text-muted/60 transition-transform group-hover:translate-x-0.5 group-hover:text-muted"
                aria-hidden
              />
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
