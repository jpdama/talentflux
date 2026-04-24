"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import {
  axisStyle,
  chartColors,
  tooltipItemStyle,
  tooltipLabelStyle,
  tooltipStyle
} from "@/components/charts/chart-theme";

export function LocationGrowthChart({
  data
}: {
  data: Array<{ name: string; newLocationCount30d: number }>;
}) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={chartColors.grid} strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="name"
            stroke={axisStyle.stroke}
            tickLine={false}
            axisLine={false}
            style={{ fontSize: 10 }}
            interval={0}
            angle={-28}
            textAnchor="end"
            height={58}
          />
          <YAxis
            stroke={axisStyle.stroke}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            style={{ fontSize: axisStyle.fontSize }}
            width={24}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            itemStyle={tooltipItemStyle}
            labelStyle={tooltipLabelStyle}
            cursor={{ fill: chartColors.primarySoft }}
            formatter={(value: number) => [`${value} new`, "Locations"]}
          />
          <Bar dataKey="newLocationCount30d" fill={chartColors.accent} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
