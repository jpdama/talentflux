"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import {
  chartPalette,
  tooltipItemStyle,
  tooltipLabelStyle,
  tooltipStyle
} from "@/components/charts/chart-theme";

export function FunctionMixChart({
  data
}: {
  data: Array<{ roleFamily: string; count: number; share: number }>;
}) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="flex h-[280px] items-center gap-4">
      <div className="relative h-full w-[180px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="roleFamily"
              innerRadius={58}
              outerRadius={86}
              paddingAngle={2}
              stroke="hsl(222, 28%, 9%)"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={entry.roleFamily} fill={chartPalette[index % chartPalette.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [`${value} roles`, name]}
              contentStyle={tooltipStyle}
              itemStyle={tooltipItemStyle}
              labelStyle={tooltipLabelStyle}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="numeric text-2xl font-semibold text-foreground">{total}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted">roles</span>
        </div>
      </div>
      <ul className="flex-1 space-y-1.5 overflow-y-auto">
        {data.map((entry, index) => {
          const share = total > 0 ? Math.round((entry.count / total) * 100) : 0;
          return (
            <li key={entry.roleFamily} className="flex items-center gap-2 text-xs">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ background: chartPalette[index % chartPalette.length] }}
                aria-hidden
              />
              <span className="flex-1 truncate text-muted-strong">{entry.roleFamily}</span>
              <span className="numeric text-muted">{share}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
