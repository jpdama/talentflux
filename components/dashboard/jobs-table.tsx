"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  createColumnHelper,
  type SortingState
} from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import type { CanonicalJob } from "@/lib/types";

const helper = createColumnHelper<CanonicalJob>();

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
        cell: (info) => <span className="font-medium text-white">{info.getValue()}</span>
      }),
      helper.accessor("title", {
        header: "Role",
        cell: (info) => (
          <Link href={`/companies/${info.row.original.companySlug}`} className="text-slate-200 hover:text-cyan-200">
            {info.getValue()}
          </Link>
        )
      }),
      helper.accessor("roleFamily", { header: "Function" }),
      helper.accessor("locationText", {
        header: "Location",
        cell: (info) => info.getValue() ?? "Unknown"
      }),
      helper.accessor("workplaceType", { header: "Work mode" }),
      helper.accessor("firstSeenAt", {
        header: "First seen",
        cell: (info) => new Date(info.getValue()).toLocaleDateString()
      }),
      helper.display({
        id: "sourceUrl",
        header: "Source",
        cell: (info) => (
          <a
            href={info.row.original.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-cyan-300 transition hover:text-cyan-200"
          >
            Open
          </a>
        )
      })
    ],
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-300">Current openings</div>
          <h3 className="mt-2 text-xl font-semibold text-white">Role-level evidence</h3>
        </div>
        <div className="w-full md:max-w-xs">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search roles, skills, or locations" />
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/[0.03]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-slate-400"
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          className="transition hover:text-slate-200"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-white/8">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="bg-transparent transition hover:bg-white/[0.03]">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-4 text-sm text-slate-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
