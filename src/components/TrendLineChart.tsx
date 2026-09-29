"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatCurrency } from "@/lib/expenses";

export default function TrendLineChart({
  data
}: {
  data: { label: string; total: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ left: 4, right: 12 }}>
        <CartesianGrid vertical={false} stroke="#242B2E" />
        <XAxis
          dataKey="label"
          tick={{ fontFamily: "var(--font-inter)", fontSize: 11, fill: "#7D8688" }}
          axisLine={{ stroke: "#242B2E" }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => formatCurrency(v)}
          tick={{ fontFamily: "var(--font-inter)", fontSize: 11, fill: "#7D8688" }}
          axisLine={false}
          tickLine={false}
          width={64}
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
        <Line
          type="monotone"
          dataKey="total"
          stroke="#2FE6C8"
          strokeWidth={2}
          dot={{ r: 4, fill: "#2FE6C8" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
