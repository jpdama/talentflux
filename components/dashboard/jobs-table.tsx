"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ExternalLink, Search } from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  createColumnHelper,
  type SortingState
} from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { CanonicalJob } from "@/lib/types";

const helper = createColumnHelper<CanonicalJob>();

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function JobsTable({ jobs }: { jobs: CanonicalJob[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "firstSeenAt", desc: true }]);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return jobs;
    const lowered = query.toLowerCase();
    return jobs.filter((job) =>
      [job.companyName, job.title, job.roleFamily, job.locationText ?? "", job.skills.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(lowered)
    );
  }, [jobs, query]);

  const table = useReactTable({
    data: filtered,
    columns: [
      helper.accessor("companyName", {
        header: "Company",
        cell: (info) => (
          <Link
            href={`/companies/${info.row.original.companySlug}`}
            className="font-medium text-foreground transition-colors hover:text-primary"
          >
            {info.getValue()}
          </Link>
        )
      }),
      helper.accessor("title", {
        header: "Role",
        cell: (info) => <span className="text-muted-strong">{info.getValue()}</span>
      }),
      helper.accessor("roleFamily", {
        header: "Function",
        cell: (info) => (
          <Badge variant="outline" className="font-normal">
            {info.getValue()}
          </Badge>
        )
      }),
      helper.accessor("locationText", {
        header: "Location",
        cell: (info) => <span className="text-muted">{info.getValue() ?? "—"}</span>
      }),
      helper.accessor("workplaceType", {
        header: "Mode",
        cell: (info) => {
          const value = info.getValue();
          if (!value || value === "unknown") return <span className="text-muted/70">—</span>;
          return <span className="text-muted capitalize">{value}</span>;
        }
      }),
      helper.accessor("firstSeenAt", {
        header: "Posted",
        cell: (info) => <span className="text-muted numeric">{formatDate(info.getValue())}</span>
      }),
      helper.display({
        id: "sourceUrl",
        header: "",
        cell: (info) => (
          <a
            href={info.row.original.sourceUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Open job posting in new tab"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-raised hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )
      })
    ],
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } }
  });

  const totalRows = filtered.length;
  const pageState = table.getState().pagination;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-foreground">Openings</span>
          <span className="numeric text-xs text-muted">{totalRows} roles</span>
        </div>
        <div className="relative w-full md:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search roles, skills, locations…"
            className="pl-9"
            aria-label="Search openings"
          />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="nice-scroll overflow-x-auto">
          <table className="min-w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border bg-surface-raised/60">
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        scope="col"
                        className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted"
                      >
                        {header.isPlaceholder ? null : (
                          <button
                            type="button"
                            disabled={!canSort}
                            onClick={header.column.getToggleSortingHandler()}
                            className={cn(
                              "inline-flex items-center gap-1.5 transition-colors",
                              canSort && "hover:text-foreground"
                            )}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {canSort ? (
                              sorted === "asc" ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : sorted === "desc" ? (
                                <ArrowDown className="h-3 w-3" />
                              ) : (
                                <ArrowUpDown className="h-3 w-3 opacity-40" />
                              )
                            ) : null}
                          </button>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="text-sm text-muted-strong">No roles match these filters.</div>
                    <div className="mt-1 text-xs text-muted">Try widening the time range or clearing a filter.</div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-surface-raised/50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalRows > pageState.pageSize ? (
          <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-2.5 text-xs text-muted">
            <span className="numeric">
              {pageState.pageIndex * pageState.pageSize + 1}–
              {Math.min((pageState.pageIndex + 1) * pageState.pageSize, totalRows)} of {totalRows}
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
              >
                Previous
              </Button>
              <Button variant="ghost" size="sm" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
