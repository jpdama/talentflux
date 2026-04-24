import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { InsightAlert } from "@/lib/types";

export function AlertCard({ alert }: { alert: InsightAlert }) {
  const variant = alert.severity === "high" ? "danger" : alert.severity === "medium" ? "warning" : "accent";

  return (
    <Card className="group flex h-full flex-col justify-between gap-4 transition-colors hover:border-border-strong">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Badge variant={variant} dot>
            {alert.type}
          </Badge>
          <Link
            href={`/companies/${alert.companySlug}`}
            className="inline-flex items-center gap-0.5 text-xs text-muted transition-colors hover:text-primary"
          >
            View
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div>
          <h3 className="text-base font-semibold leading-snug text-foreground">{alert.title}</h3>
          <p className="mt-1.5 text-sm leading-6 text-muted-strong">{alert.description}</p>
        </div>
      </div>
      <p className="border-t border-border pt-3 text-xs leading-5 text-muted">{alert.reason}</p>
    </Card>
  );
}
