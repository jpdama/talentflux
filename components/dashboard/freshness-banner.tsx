import { AlertTriangle, Database, Globe, Info } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type { CohortSnapshot } from "@/lib/types";

function formatRelative(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  if (Number.isNaN(then)) return "just now";
  const diffSec = Math.max(0, Math.floor((now - then) / 1000));
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

export function FreshnessBanner({ meta }: { meta: CohortSnapshot["meta"] }) {
  const tone: "success" | "warning" | "info" = meta.usedFallback
    ? "warning"
    : meta.source === "database"
      ? "success"
      : "info";

  const Icon = meta.usedFallback ? AlertTriangle : meta.source === "database" ? Database : Globe;

  const label =
    meta.source === "database"
      ? "Persisted snapshot"
      : meta.source === "live"
        ? "Live public data"
        : "Sample data";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-3 md:flex-row md:items-center md:justify-between",
        tone === "success" && "border-success/25 bg-success/5",
        tone === "warning" && "border-warning/25 bg-warning/5",
        tone === "info" && "border-primary/20 bg-primary/5"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
            tone === "success" && "bg-success/15 text-success",
            tone === "warning" && "bg-warning/15 text-warning",
            tone === "info" && "bg-primary/15 text-primary"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
            <span className="font-medium text-foreground">{label}</span>
            <span className="text-xs text-muted">·</span>
            <span className="text-xs text-muted">
              updated {formatRelative(meta.generatedAt)}
            </span>
          </div>
          {meta.notices[0] ? <p className="text-xs leading-5 text-muted">{meta.notices[0]}</p> : null}
        </div>
      </div>
      {meta.notices.length > 1 ? (
        <div className="flex items-center gap-2 rounded-md bg-surface-raised px-3 py-1.5 text-xs text-muted">
          <Info className="h-3 w-3" />
          {meta.notices.slice(1).join(" · ")}
        </div>
      ) : null}
    </div>
  );
}
