import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="shell flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Compass className="h-5 w-5" />
      </div>
      <div className="max-w-xl space-y-3">
        <h1 className="text-3xl font-semibold text-foreground md:text-4xl">This view has no signal</h1>
        <p className="text-sm leading-6 text-muted-strong md:text-base">
          The page you requested doesn't exist in the current cohort. Head back to the dashboard to inspect live hiring
          momentum.
        </p>
      </div>
      <div className="flex gap-2">
        <Button asChild>
          <Link href="/dashboard">Open dashboard</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/">
            <ArrowLeft className="h-3.5 w-3.5" />
            Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
