"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Download, RotateCcw, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";
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
  const [expanded, setExpanded] = useState(false);

  const selectedCompanies = useMemo(() => new Set(filters.companies), [filters.companies]);
  const activeFilterCount =
    (filters.companies.length > 0 ? 1 : 0) +
    (filters.roleFamily !== "All" ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.provider !== "all" ? 1 : 0) +
    (filters.remoteOnly ? 1 : 0) +
    (filters.aiOnly ? 1 : 0);

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

  function reset() {
    router.replace(pathname as never, { scroll: false });
  }

  return (
    <div className="surface p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
          aria-expanded={expanded}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/15 px-1.5 text-[11px] font-semibold text-primary">
              {activeFilterCount}
            </span>
          ) : null}
          <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
        </button>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 ? (
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          ) : null}
          <a
            href={`/api/export?${searchParams.toString()}`}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border-strong bg-surface-raised px-3 text-xs font-medium text-foreground transition-colors hover:border-muted/40"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </a>
        </div>
      </div>

      {expanded ? (
        <div className="mt-5 space-y-5 border-t border-border pt-5">
          <div>
            <div className="mb-2 text-xs font-medium text-muted">Companies</div>
            <div className="flex flex-wrap gap-1.5">
              {companies.map((company) => {
                const isSelected = selectedCompanies.has(company.slug);
                return (
                  <button
                    key={company.slug}
                    type="button"
                    onClick={() => toggleCompany(company.slug)}
                    aria-pressed={isSelected}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                      isSelected
                        ? "border-primary/50 bg-primary/15 text-primary"
                        : "border-border-strong bg-surface-raised text-muted-strong hover:border-muted/40 hover:text-foreground"
                    )}
                  >
                    {company.name}
                    {isSelected ? <X className="h-3 w-3" /> : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
            <Select
              label="Function"
              value={filters.roleFamily ?? "All"}
              onChange={(event) => apply({ roleFamily: event.target.value === "All" ? undefined : event.target.value })}
            >
              <option value="All">All functions</option>
              {roleFamilies.map((roleFamily) => (
                <option key={roleFamily} value={roleFamily}>
                  {roleFamily}
                </option>
              ))}
            </Select>

            <Select
              label="Location"
              value={filters.location ?? ""}
              onChange={(event) => apply({ location: event.target.value || undefined })}
            >
              <option value="">All locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </Select>

            <Select
              label="Provider"
              value={filters.provider ?? "all"}
              onChange={(event) => apply({ provider: event.target.value === "all" ? undefined : event.target.value })}
            >
              <option value="all">All providers</option>
              <option value="greenhouse">Greenhouse</option>
              <option value="lever">Lever</option>
            </Select>

            <Select
              label="Time range"
              value={String(filters.timeRangeDays)}
              onChange={(event) => apply({ timeRange: event.target.value })}
            >
              <option value="14">Last 14 days</option>
              <option value="30">Last 30 days</option>
              <option value="60">Last 60 days</option>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <ToggleChip
              label="Remote only"
              active={filters.remoteOnly ?? false}
              onChange={(v) => apply({ remoteOnly: v ? "true" : undefined })}
            />
            <ToggleChip
              label="AI roles only"
              active={filters.aiOnly ?? false}
              onChange={(v) => apply({ aiOnly: v ? "true" : undefined })}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ToggleChip({
  label,
  active,
  onChange
}: {
  label: string;
  active: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
        active
          ? "border-primary/50 bg-primary/15 text-primary"
          : "border-border-strong bg-surface-raised text-muted-strong hover:border-muted/40 hover:text-foreground"
      )}
    >
      <span
        className={cn(
          "flex h-3.5 w-3.5 items-center justify-center rounded-sm border transition-colors",
          active ? "border-primary bg-primary text-primaryForeground" : "border-border-strong"
        )}
        aria-hidden
      >
        {active ? (
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M2.5 6.5L5 9L9.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </span>
      {label}
    </button>
  );
}
