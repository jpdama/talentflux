import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { env } from "@/lib/validations/env";
import { hasDatabase } from "@/db/client";
import { runIngest } from "@/lib/ingest/run-ingest";

declare global {
  var __talentfluxRefresh: { lastRunAt?: number } | undefined;
}

function getRefreshStore() {
  if (!global.__talentfluxRefresh) {
    global.__talentfluxRefresh = {};
  }
  return global.__talentfluxRefresh;
}

function invalidate() {
  (globalThis as { __talentfluxLiveCache?: unknown }).__talentfluxLiveCache = undefined;
  try {
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/companies/[slug]", "page");
  } catch {
    // revalidatePath is best-effort; ignore errors in test contexts
  }
}

export async function POST() {
  const store = getRefreshStore();
  const now = Date.now();
  const interval = env.LIVE_REFRESH_WINDOW_MINUTES * 60 * 1000;

  if (store.lastRunAt && now - store.lastRunAt < interval) {
    const minutesRemaining = Math.ceil((interval - (now - store.lastRunAt)) / 60000);
    return NextResponse.json({
      ok: false,
      message: `Cooldown active — try again in ${minutesRemaining} minute${minutesRemaining === 1 ? "" : "s"}.`
    });
  }

  if (!hasDatabase()) {
    store.lastRunAt = now;
    invalidate();
    return NextResponse.json({
      ok: true,
      message: "Refreshed live cache. Page reload will re-fetch providers."
    });
  }

  try {
    store.lastRunAt = now;
    await runIngest();
    invalidate();
    return NextResponse.json({
      ok: true,
      message: "Ingest complete — reloading dashboard."
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Live refresh failed."
      },
      { status: 500 }
    );
  }
}
