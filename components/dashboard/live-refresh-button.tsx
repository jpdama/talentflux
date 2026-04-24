"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RefreshCw, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type Status = "idle" | "success" | "error";

export function LiveRefreshButton() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const busy = isPending || isRefreshing;

  async function handleRefresh() {
    setStatus("idle");
    setMessage(null);
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/live-refresh", { method: "POST" });
      const payload = (await response.json()) as { ok: boolean; message: string };
      setMessage(payload.message);
      setStatus(payload.ok ? "success" : "error");
      if (payload.ok) {
        startTransition(() => router.refresh());
      }
    } catch {
      setStatus("error");
      setMessage("Network error — please try again.");
    } finally {
      setIsRefreshing(false);
      setTimeout(() => {
        setMessage(null);
        setStatus("idle");
      }, 6000);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="secondary" disabled={busy} onClick={handleRefresh}>
        <RefreshCw className={cn("h-3.5 w-3.5", busy && "animate-spin")} />
        {busy ? "Refreshing…" : "Refresh data"}
      </Button>
      {message ? (
        <div
          className={cn(
            "inline-flex items-center gap-1.5 text-xs",
            status === "success" && "text-success",
            status === "error" && "text-danger",
            status === "idle" && "text-muted"
          )}
          role="status"
        >
          {status === "success" ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : status === "error" ? (
            <XCircle className="h-3.5 w-3.5" />
          ) : null}
          <span className="hidden max-w-xs truncate md:inline">{message}</span>
        </div>
      ) : null}
    </div>
  );
}
