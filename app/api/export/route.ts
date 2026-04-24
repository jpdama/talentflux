import { NextResponse } from "next/server";

import { buildJobsCsv } from "@/lib/export/jobs-export";
import { filtersFromSearchParams } from "@/lib/analytics/snapshot";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const csv = await buildJobsCsv(filtersFromSearchParams(Object.fromEntries(url.searchParams.entries())));

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="talentflux-export.csv"'
    }
  });
}
