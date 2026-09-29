"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { InstrumentTotal, formatCurrency } from "@/lib/expenses";

export default function InstrumentBarChart({ totals }: { totals: InstrumentTotal[] }) {
  const data = totals.filter((t) => t.total > 0);

  if (data.length === 0) {
    return (
      <p className="font-body text-sm text-ink/50">No spend to chart this month yet.</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 44)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid horizontal={false} stroke="#242B2E" />
        <XAxis
          type="number"
          tickFormatter={(v) => formatCurrency(v)}
          tick={{ fontFamily: "var(--font-inter)", fontSize: 11, fill: "#7D8688" }}
          axisLine={{ stroke: "#242B2E" }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="instrumentName"
          width={100}
          tick={{ fontFamily: "var(--font-inter)", fontSize: 12, fill: "#F2F4F3" }}
          axisLine={{ stroke: "#242B2E" }}
          tickLine={false}
        />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            borderRadius: 0,
            border: "1px solid #242B2E",
            backgroundColor: "#14181B",
            fontFamily: "var(--font-inter)",
            fontSize: 12
          }}
          itemStyle={{ color: "#F2F4F3" }}
          labelStyle={{ color: "#F2F4F3" }}
        />
        <Bar dataKey="total" fill="#2FE6C8" radius={[0, 4, 4, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
