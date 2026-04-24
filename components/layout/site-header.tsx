import Link from "next/link";

import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-slate-950/65 backdrop-blur-xl">
      <div className="shell flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 text-sm text-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-400 to-orange-300 font-semibold text-slate-950">
            TP
          </div>
          <div>
            <div className="font-semibold tracking-wide">TalentPulse</div>
            <div className="text-xs text-slate-400">Hiring intelligence for AI/SaaS</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <Link href="/dashboard" className="transition hover:text-white">
            Dashboard
          </Link>
          <Link href="/methodology" className="transition hover:text-white">
            Methodology
          </Link>
        </nav>

        <Button asChild variant="secondary" size="sm">
          <Link href="/dashboard">Launch Dashboard</Link>
        </Button>
      </div>
    </header>
  );
}
