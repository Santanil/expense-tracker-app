import { Budget } from "./budgets";
import { CategoryTotal, Expense, netAmount } from "./expenses";

// Validated categorical palette (see references/palette.md check run) — used
// only for the category pie, where slices are genuinely distinct identities.
// Other charts use a single brand hue since they're one series (magnitude/trend).
export const CATEGORY_PALETTE = [
  "#B23A63", // rose
  "#3F8F3A", // moss
  "#6A5ACD", // violet
  "#A8770A", // ochre
  "#0F8768", // chart teal
  "#B5482D" // rust
];

export const OTHER_LABEL = "Other";

// Deterministic per-category color (independent of list order/position), so
// a category's badge color stays stable even as the user's category list
// (Settings) changes — unlike the pie chart's rank-based assignment.
export function getCategoryColor(category: string): string {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  }
  return CATEGORY_PALETTE[hash % CATEGORY_PALETTE.length];
}

export function foldToTopN(totals: CategoryTotal[], max = 5): CategoryTotal[] {
  if (totals.length <= max) return totals;
  const top = totals.slice(0, max);
  const restTotal = totals.slice(max).reduce((sum, t) => sum + t.total, 0);
  return [...top, { category: OTHER_LABEL, total: restTotal }];
}

export type MonthBucket = {
  key: string;
  label: string;
  month: number;
  year: number;
  start: string;
  end: string;
};

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function getLastNMonths(n: number, reference = new Date()): MonthBucket[] {
  const months: MonthBucket[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(reference.getFullYear(), reference.getMonth() - i, 1);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    months.push({
      key: `${year}-${String(month).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      month,
      year,
      start: toISODate(start),
      end: toISODate(end)
    });
  }
  return months;
}

export function getYearMonths(reference = new Date()): MonthBucket[] {
  const year = reference.getFullYear();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(year, i, 1);
    const month = i + 1;
    const start = new Date(year, i, 1);
    const end = new Date(year, i + 1, 0);
    return {
      key: `${year}-${String(month).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-IN", { month: "short" }),
      month,
      year,
      start: toISODate(start),
      end: toISODate(end)
    };
  });
}

export function bucketMonthlyNet(expenses: Expense[], months: MonthBucket[]) {
  const totals = new Map<string, number>(months.map((m) => [m.key, 0]));
  for (const expense of expenses) {
    const key = expense.date.slice(0, 7);
    if (totals.has(key)) {
      totals.set(key, (totals.get(key) ?? 0) + netAmount(expense));
    }
  }
  return months.map((m) => ({ label: m.label, total: totals.get(m.key) ?? 0 }));
}

export function combineBudgetVsActual(
  months: MonthBucket[],
  budgets: Budget[],
  monthlyNet: { label: string; total: number }[]
) {
  return months.map((m, i) => {
    const budget = budgets.find((b) => b.month === m.month && b.year === m.year);
    return {
      label: m.label,
      budget: budget?.budget_amount ?? 0,
      actual: monthlyNet[i]?.total ?? 0
    };
  });
}
