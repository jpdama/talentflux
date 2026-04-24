import Link from "next/link";

import { CompanySparkline } from "@/components/charts/company-sparkline";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { CompanySnapshot } from "@/lib/types";

export function CompanyLeaderboard({ companies }: { companies: CompanySnapshot[] }) {
  return (
    <Card className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-300">Leaderboard</div>
          <h3 className="mt-2 text-xl font-semibold text-white">Momentum ranking</h3>
        </div>
        <Badge>{companies.length} companies</Badge>
      </div>
      <div className="space-y-4">
        {companies.map((company, index) => (
          <Link
            key={company.company.slug}
            href={`/companies/${company.company.slug}`}
            className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:border-cyan-300/25 hover:bg-white/[0.06] md:flex-row md:items-center md:justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-sm text-slate-200">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <div className="font-medium text-white">{company.company.name}</div>
                <div className="text-sm text-slate-400">{company.company.sector}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <CompanySparkline data={company.history} />
              <div className="text-right">
                <div className="text-lg font-semibold text-white">{company.metrics.momentumScore}</div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Momentum</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
