export function SiteFooter() {
  return (
    <footer className="border-t border-white/8 bg-slate-950/70">
      <div className="shell flex flex-col gap-4 py-8 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <div>
          TalentPulse turns public job boards into competitor strategy signals for founders, GTM teams, investors, and
          recruiting leaders.
        </div>
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
          Public-data dashboard • Next.js • Neon • Drizzle
        </div>
      </div>
    </footer>
  );
}
