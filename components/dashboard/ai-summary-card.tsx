import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { GroundedSummary } from "@/lib/types";

export function AiSummaryCard({
  title,
  summary
}: {
  title: string;
  summary: GroundedSummary;
}) {
  return (
    <Card className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.22em] text-cyan-300">{title}</div>
          <h3 className="mt-2 text-xl font-semibold text-white">{summary.headline}</h3>
        </div>
        <Badge variant={summary.usedFallback ? "warning" : "success"}>{summary.usedFallback ? "Rules" : "AI"}</Badge>
      </div>
      <ul className="space-y-3 text-sm leading-6 text-slate-200">
        {summary.bullets.map((bullet) => (
          <li key={bullet} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
            {bullet}
          </li>
        ))}
      </ul>
      <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/8 px-4 py-3 text-sm text-cyan-50">
        <div className="font-medium text-cyan-200">Watch item</div>
        <p className="mt-1 leading-6">{summary.watchItem}</p>
      </div>
      <div className="space-y-2 text-xs uppercase tracking-[0.18em] text-slate-500">
        <div>Grounding</div>
        <ul className="space-y-2 normal-case tracking-normal text-slate-400">
          {summary.evidence.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
