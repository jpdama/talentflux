import { Badge } from "@/components/ui/badge";
import type { CohortSnapshot } from "@/lib/types";

export function FreshnessBanner({ meta }: { meta: CohortSnapshot["meta"] }) {
  const variant = meta.usedFallback ? "warning" : meta.source === "database" ? "success" : "default";

  return (
    <div className="panel-glow flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <Badge variant={variant}>{meta.source}</Badge>
          <span className="text-sm text-slate-200">Updated {new Date(meta.generatedAt).toLocaleString()}</span>
        </div>
        <p className="text-sm text-slate-400">{meta.notices[0]}</p>
      </div>
      {meta.notices.length > 1 ? (
        <div className="max-w-md text-xs leading-6 text-slate-500">{meta.notices.slice(1).join(" • ")}</div>
      ) : null}
    </div>
  );
}
