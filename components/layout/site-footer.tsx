import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-background">
      <div className="shell grid gap-8 py-10 md:grid-cols-[1.25fr_1fr_1fr]">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div
              aria-hidden
              className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-primary to-accent text-[10px] font-bold text-primaryForeground"
            >
              TF
            </div>
            <span className="text-sm font-semibold text-foreground">TalentFlux</span>
          </div>
          <p className="max-w-sm text-sm leading-6 text-muted">
            Public hiring intelligence for founders, GTM teams, investors, and recruiting leaders — built on deterministic
            classification and transparent scoring.
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <div className="text-xs font-medium uppercase tracking-wider text-muted">Product</div>
          <ul className="space-y-2">
            <li>
              <Link href="/dashboard" className="text-muted-strong transition-colors hover:text-foreground">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/methodology" className="text-muted-strong transition-colors hover:text-foreground">
                Methodology
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3 text-sm">
          <div className="text-xs font-medium uppercase tracking-wider text-muted">Stack</div>
          <ul className="space-y-2 text-muted-strong">
            <li>Next.js 15 · App Router</li>
            <li>Neon Postgres · Drizzle</li>
            <li>Greenhouse · Lever APIs</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="shell flex flex-col gap-2 py-4 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} TalentFlux. Public-data hiring intelligence.</span>
          <span className="font-mono">v1.0 · dark mode only</span>
        </div>
      </div>
    </footer>
  );
}
