import { Eye, Sparkles } from "lucide-react";

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
    <Card className="flex h-full flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="eyebrow flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            {title}
          </div>
          <h3 className="text-lg font-semibold leading-snug text-foreground">{summary.headline}</h3>
        </div>
        <Badge variant={summary.usedFallback ? "warning" : "accent"} dot>
          {summary.usedFallback ? "Rules" : "AI"}
        </Badge>
      </div>

      <ul className="space-y-2">
        {summary.bullets.map((bullet) => (
          <li
            key={bullet}
            className="flex gap-2.5 rounded-lg border border-border bg-surface-raised/70 px-3 py-2.5 text-sm leading-6 text-muted-strong"
          >
            <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
            {bullet}
          </li>
        ))}
      </ul>

      <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
          <Eye className="h-3 w-3" />
          Watch item
        </div>
        <p className="mt-1 text-sm leading-6 text-foreground/90">{summary.watchItem}</p>
      </div>

      {summary.evidence.length > 0 ? (
        <details className="group text-xs text-muted">
          <summary className="cursor-pointer font-medium transition-colors hover:text-muted-strong">
            Grounding evidence ({summary.evidence.length})
          </summary>
          <ul className="mt-2 space-y-1 border-l border-border pl-3">
            {summary.evidence.map((item) => (
              <li key={item} className="leading-5">
                {item}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </Card>
  );
}
