"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { DashboardFilters } from "@/lib/types";

export function FilterBar({
  filters,
  companies,
  locations,
  roleFamilies
}: {
  filters: DashboardFilters;
  companies: Array<{ slug: string; name: string }>;
  locations: string[];
  roleFamilies: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCompanies = useMemo(() => new Set(filters.companies), [filters.companies]);

  function apply(update: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(update).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    const nextUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    router.replace(nextUrl as never, { scroll: false });
  }

  function toggleCompany(slug: string) {
    const next = new Set(selectedCompanies);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    apply({
      companies: next.size ? [...next].join(",") : undefined
    });
  }

  return (
    <div className="panel space-y-5 p-5">
      <div className="flex flex-wrap items-center gap-3">
        {companies.map((company) => (
          <button
            key={company.slug}
            type="button"
            onClick={() => toggleCompany(company.slug)}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              selectedCompanies.has(company.slug)
                ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100"
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {company.name}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <select
          value={filters.roleFamily ?? "All"}
          onChange={(event) => apply({ roleFamily: event.target.value === "All" ? undefined : event.target.value })}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
        >
          <option value="All">All functions</option>
          {roleFamilies.map((roleFamily) => (
            <option key={roleFamily} value={roleFamily}>
              {roleFamily}
            </option>
          ))}
        </select>

        <select
          value={filters.location ?? ""}
          onChange={(event) => apply({ location: event.target.value || undefined })}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
        >
          <option value="">All locations</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>

        <select
          value={filters.provider ?? "all"}
          onChange={(event) => apply({ provider: event.target.value === "all" ? undefined : event.target.value })}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
        >
          <option value="all">All providers</option>
          <option value="greenhouse">Greenhouse</option>
          <option value="lever">Lever</option>
        </select>

        <select
          value={String(filters.timeRangeDays)}
          onChange={(event) => apply({ timeRange: event.target.value })}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
        >
          <option value="14">14 days</option>
          <option value="30">30 days</option>
          <option value="60">60 days</option>
        </select>

        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={filters.remoteOnly ?? false}
            onChange={(event) => apply({ remoteOnly: event.target.checked ? "true" : undefined })}
          />
          Remote only
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={filters.aiOnly ?? false}
            onChange={(event) => apply({ aiOnly: event.target.checked ? "true" : undefined })}
          />
          AI roles only
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.replace(pathname as never, { scroll: false })}>
          Reset filters
        </Button>
        <a
          href={`/api/export?${searchParams.toString()}`}
          className="inline-flex h-9 items-center rounded-full border border-white/10 bg-white/5 px-4 text-xs uppercase tracking-[0.2em] text-slate-300 transition hover:bg-white/10"
        >
          Export CSV
        </a>
      </div>
    </div>
  );
}
