import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="shell flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
      <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
        Not Found
      </div>
      <div className="max-w-2xl space-y-4">
        <h1 className="text-4xl font-semibold md:text-6xl">This view has no signal.</h1>
        <p className="text-lg text-slate-300">
          The page you requested does not exist in the current cohort. Return to the dashboard to inspect live hiring
          momentum.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard">Open dashboard</Link>
      </Button>
    </div>
  );
}
