import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { InsightAlert } from "@/lib/types";

export function AlertCard({ alert }: { alert: InsightAlert }) {
  const variant = alert.severity === "high" ? "danger" : alert.severity === "medium" ? "warning" : "default";

  return (
    <Card className="flex h-full flex-col justify-between gap-5">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Badge variant={variant}>{alert.type}</Badge>
          <Link className="text-xs text-cyan-300 transition hover:text-cyan-200" href={`/companies/${alert.companySlug}`}>
            View company
          </Link>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{alert.description}</p>
        </div>
      </div>
      <p className="text-sm leading-6 text-slate-500">{alert.reason}</p>
    </Card>
  );
}
