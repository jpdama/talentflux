import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { Card } from "@/components/ui/card";

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
    <Card className="space-y-4">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="flex items-end justify-between gap-4">
        <div className="text-3xl font-semibold text-white">{value}</div>
        {typeof delta === "number" ? (
          <div
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ${
              positive
                ? "bg-emerald-400/10 text-emerald-200"
                : negative
                  ? "bg-rose-500/10 text-rose-100"
                  : "bg-white/5 text-slate-300"
            }`}
          >
            {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : negative ? <ArrowDownRight className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
            {Math.abs(delta)}
          </div>
        ) : null}
      </div>
      <div className="text-sm leading-6 text-slate-400">{detail}</div>
    </Card>
  );
}
