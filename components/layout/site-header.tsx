import Link from "next/link";
import type { Route } from "next";

import { Button } from "@/components/ui/button";

const NAV: Array<{ href: Route; label: string }> = [
  { href: "/dashboard" as Route, label: "Dashboard" },
  { href: "/methodology" as Route, label: "Methodology" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="shell flex h-14 items-center justify-between gap-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <div
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent font-mono text-xs font-bold text-primaryForeground shadow-sm transition-transform group-hover:scale-105"
          >
            TF
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold tracking-tight text-foreground">TalentFlux</span>
            <span className="hidden text-xs text-muted md:inline">hiring intelligence</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-strong transition-colors hover:bg-surface-raised hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="primary" size="sm">
            <Link href="/dashboard">Open dashboard</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
