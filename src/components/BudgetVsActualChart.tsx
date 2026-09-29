"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatCurrency } from "@/lib/expenses";

type Row = { label: string; budget: number; actual: number };

export default function BudgetVsActualChart({ data }: { data: Row[] }) {
  const hasAnyBudget = data.some((d) => d.budget > 0);

  if (!hasAnyBudget) {
    return (
      <p className="font-body text-sm text-ink/50">
        Set a monthly budget to see this chart.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ left: 4, right: 12 }}>
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
        <Legend
          wrapperStyle={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#F2F4F3" }}
        />
        <Bar dataKey="budget" name="Budget" fill="#3A4144" radius={[4, 4, 0, 0]} maxBarSize={20} />
        <Bar dataKey="actual" name="Actual" radius={[4, 4, 0, 0]} maxBarSize={20}>
          {data.map((row) => (
            <Cell
              key={row.label}
              fill={row.budget > 0 && row.actual > row.budget ? "#FF5B4A" : "#2FE6C8"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
