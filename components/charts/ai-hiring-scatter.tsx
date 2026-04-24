"use client";

import { ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";

export function AiHiringScatter({
  data
}: {
  data: Array<{ name: string; aiShare: number; momentumScore: number; openJobs: number }>;
}) {
  return (
    <div className="h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart>
          <XAxis
            type="number"
            dataKey="aiShare"
            name="AI share"
            tickFormatter={(value) => `${Math.round(value * 100)}%`}
            stroke="#64748b"
            tickLine={false}
            axisLine={false}
          />
          <YAxis type="number" dataKey="momentumScore" name="Momentum" stroke="#64748b" tickLine={false} axisLine={false} />
          <ZAxis type="number" dataKey="openJobs" range={[120, 680]} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(value: number, name: string) => [typeof value === "number" ? value.toFixed(2) : value, name]}
            contentStyle={{
              background: "rgba(15,23,42,0.96)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18
            }}
            itemStyle={{ color: "#e2e8f0" }}
            labelStyle={{ color: "#f8fafc" }}
          />
          <Scatter data={data} fill="#22d3ee" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
