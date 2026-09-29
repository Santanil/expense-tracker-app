"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CategoryTotal, formatCurrency } from "@/lib/expenses";
import { CATEGORY_PALETTE, foldToTopN } from "@/lib/charts";

type LabelProps = {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  category: string;
  total: number;
};

export default function CategoryPieChart({ totals }: { totals: CategoryTotal[] }) {
  const data = foldToTopN(totals.filter((t) => t.total > 0));

  if (data.length === 0) {
    return (
      <p className="font-body text-sm text-ink/50">No spend to chart this month yet.</p>
    );
  }

  const grandTotal = data.reduce((sum, d) => sum + d.total, 0);

  function renderLabel(props: LabelProps) {
    const { cx, cy, midAngle, innerRadius, outerRadius, category, total } = props;
    if (total / grandTotal <= 0.08) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.35;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#F2F4F3"
        fontSize={11}
        fontFamily="var(--font-inter)"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {category}
      </text>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="category"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
          label={renderLabel}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell
              key={entry.category}
              fill={CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]}
              stroke="#0B0E10"
              strokeWidth={2}
            />
          ))}
        </Pie>
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
      </PieChart>
    </ResponsiveContainer>
  );
}
