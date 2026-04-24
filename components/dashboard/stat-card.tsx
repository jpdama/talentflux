import { ArrowDown, ArrowUp, Minus } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export function StatCard({
  label,
  value,
  delta,
  detail
}: {
  label: string;
  value: string;
  delta?: number;
  detail: string;
}) {
  const positive = typeof delta === "number" && delta > 0;
  const negative = typeof delta === "number" && delta < 0;

  return (
    <div className="surface group relative overflow-hidden p-5 transition-colors hover:border-border-strong">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted">{label}</span>
        {typeof delta === "number" ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
              positive && "bg-success/10 text-success",
              negative && "bg-danger/10 text-danger",
              !positive && !negative && "bg-surface-raised text-muted"
            )}
            aria-label={`Change: ${delta}`}
          >
            {positive ? <ArrowUp className="h-3 w-3" /> : negative ? <ArrowDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
            {Math.abs(delta)}
          </span>
        ) : null}
      </div>
      <div className="mt-3 numeric text-3xl font-semibold tracking-tight text-foreground">{value}</div>
      <div className="mt-1.5 text-xs leading-5 text-muted">{detail}</div>
    </div>
  );
}
