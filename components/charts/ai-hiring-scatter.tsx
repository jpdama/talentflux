"use client";

import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";

import {
  axisStyle,
  chartColors,
  tooltipItemStyle,
  tooltipLabelStyle,
  tooltipStyle
} from "@/components/charts/chart-theme";

export function AiHiringScatter({
  data
}: {
  data: Array<{ name: string; aiShare: number; momentumScore: number; openJobs: number }>;
}) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 12, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid stroke={chartColors.grid} strokeDasharray="2 4" />
          <XAxis
            type="number"
            dataKey="aiShare"
            name="AI share"
            tickFormatter={(value) => `${Math.round(value * 100)}%`}
            stroke={axisStyle.stroke}
            tickLine={false}
            axisLine={false}
            style={{ fontSize: axisStyle.fontSize }}
          />
          <YAxis
            type="number"
            dataKey="momentumScore"
            name="Momentum"
            stroke={axisStyle.stroke}
            tickLine={false}
            axisLine={false}
            style={{ fontSize: axisStyle.fontSize }}
            width={32}
          />
          <ZAxis type="number" dataKey="openJobs" range={[80, 480]} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3", stroke: chartColors.muted }}
            formatter={(value: number, name: string) => [
              name === "AI share" ? `${Math.round(value * 100)}%` : typeof value === "number" ? value.toFixed(0) : value,
              name
            ]}
            contentStyle={tooltipStyle}
            itemStyle={tooltipItemStyle}
            labelStyle={tooltipLabelStyle}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.name ?? ""}
          />
          <Scatter data={data} fill={chartColors.primary} fillOpacity={0.7} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
