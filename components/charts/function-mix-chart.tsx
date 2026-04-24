"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#22d3ee", "#a78bfa", "#fb923c", "#34d399", "#f87171", "#facc15"];

export function FunctionMixChart({
  data
}: {
  data: Array<{ roleFamily: string; count: number; share: number }>;
}) {
  return (
    <div className="h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="roleFamily" innerRadius={70} outerRadius={108} paddingAngle={4}>
            {data.map((entry, index) => (
              <Cell key={entry.roleFamily} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [value, name]}
            contentStyle={{
              background: "rgba(15,23,42,0.96)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18
            }}
            itemStyle={{ color: "#e2e8f0" }}
            labelStyle={{ color: "#f8fafc" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
