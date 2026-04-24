"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import {
  axisStyle,
  chartColors,
  tooltipItemStyle,
  tooltipLabelStyle,
  tooltipStyle
} from "@/components/charts/chart-theme";

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function OpeningsTrendChart({
  data
}: {
  data: Array<{ metricDate: string; openJobs: number; aiShare: number }>;
}) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="openingsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColors.primary} stopOpacity={0.4} />
              <stop offset="100%" stopColor={chartColors.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={chartColors.grid} strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="metricDate"
            stroke={axisStyle.stroke}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatDate}
            style={{ fontSize: axisStyle.fontSize }}
            minTickGap={24}
          />
          <YAxis
            stroke={axisStyle.stroke}
            tickLine={false}
            axisLine={false}
            style={{ fontSize: axisStyle.fontSize }}
            width={32}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            itemStyle={tooltipItemStyle}
            labelStyle={tooltipLabelStyle}
            labelFormatter={formatDate}
            formatter={(value: number) => [value, "Open roles"]}
            cursor={{ stroke: chartColors.muted, strokeDasharray: "3 3" }}
          />
          <Area
            type="monotone"
            dataKey="openJobs"
            stroke={chartColors.primary}
            fill="url(#openingsGradient)"
            strokeWidth={2}
            activeDot={{ r: 4, fill: chartColors.primary, stroke: "hsl(222, 28%, 10%)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
