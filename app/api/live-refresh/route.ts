import { NextResponse } from "next/server";

import { env } from "@/lib/validations/env";
import { hasDatabase } from "@/db/client";
import { runIngest } from "@/lib/ingest/run-ingest";

declare global {
  var __talentpulseRefresh: { lastRunAt?: number } | undefined;
}

function getRefreshStore() {
  if (!global.__talentpulseRefresh) {
    global.__talentpulseRefresh = {};
  }
  return global.__talentpulseRefresh;
}

export async function POST() {
  const store = getRefreshStore();
  const now = Date.now();
  const interval = env.LIVE_REFRESH_WINDOW_MINUTES * 60 * 1000;

  if (store.lastRunAt && now - store.lastRunAt < interval) {
    const minutesRemaining = Math.ceil((interval - (now - store.lastRunAt)) / 60000);
    return NextResponse.json({
      ok: false,
      message: `Refresh window active. Try again in ${minutesRemaining} minute(s).`
    });
  }

  if (!hasDatabase()) {
    store.lastRunAt = now;
    return NextResponse.json({
      ok: true,
      message: "No database configured, so the dashboard will continue using live or sample reads on page load."
    });
  }

  try {
    store.lastRunAt = now;
    await runIngest();
    return NextResponse.json({
      ok: true,
      message: "Refresh completed. Reloading dashboard."
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
