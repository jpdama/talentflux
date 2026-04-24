"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function LiveRefreshButton() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3">
      <Button
        size="sm"
        variant="secondary"
        disabled={isPending}
        onClick={async () => {
          setMessage(null);
          const response = await fetch("/api/live-refresh", { method: "POST" });
          const payload = (await response.json()) as { ok: boolean; message: string };
          setMessage(payload.message);
          if (payload.ok) {
            startTransition(() => {
              router.refresh();
            });
          }
        }}
      >
        {isPending ? "Refreshing..." : "Live refresh"}
      </Button>
      {message ? <span className="text-xs text-slate-400">{message}</span> : null}
    </div>
  );
}
