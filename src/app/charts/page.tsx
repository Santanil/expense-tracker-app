"use client";

import { useCallback, useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import CategoryPieChart from "@/components/CategoryPieChart";
import InstrumentBarChart from "@/components/InstrumentBarChart";
import TrendLineChart from "@/components/TrendLineChart";
import BudgetVsActualChart from "@/components/BudgetVsActualChart";
import Card from "@/components/Card";
import { useAuth } from "@/lib/auth-context";
import {
  Expense,
  fetchExpensesInRange,
  getMonthRange,
  getYearRange,
  sumByCategory,
  sumByInstrument
} from "@/lib/expenses";
import { fetchAllBudgets } from "@/lib/budgets";
import {
  bucketMonthlyNet,
  combineBudgetVsActual,
  getLastNMonths,
  getYearMonths
} from "@/lib/charts";

const TREND_MONTHS = getLastNMonths(6);
const YEAR_MONTHS = getYearMonths();

export default function ChartsPage() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const [monthExpenses, setMonthExpenses] = useState<Expense[]>([]);
  const [trendExpenses, setTrendExpenses] = useState<Expense[]>([]);
  const [yearExpenses, setYearExpenses] = useState<Expense[]>([]);
  const [budgetRows, setBudgetRows] = useState<
    { label: string; budget: number; actual: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const { start: monthStart, end: monthEnd } = getMonthRange();
      const { start: yearStart, end: yearEnd } = getYearRange();
      const trendStart = TREND_MONTHS[0].start;
      const trendEnd = TREND_MONTHS[TREND_MONTHS.length - 1].end;

      const [monthData, trendData, yearData, budgets] = await Promise.all([
        fetchExpensesInRange(userId, monthStart, monthEnd),
        fetchExpensesInRange(userId, trendStart, trendEnd),
        fetchExpensesInRange(userId, yearStart, yearEnd),
        fetchAllBudgets(userId)
      ]);

      setMonthExpenses(monthData);
      setTrendExpenses(trendData);
      setYearExpenses(yearData);
      setBudgetRows(
        combineBudgetVsActual(
          TREND_MONTHS,
          budgets,
          bucketMonthlyNet(trendData, TREND_MONTHS)
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load chart data.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const categoryTotals = sumByCategory(monthExpenses);
  const instrumentTotals = sumByInstrument(monthExpenses);
  const monthlyTrend = bucketMonthlyNet(trendExpenses, TREND_MONTHS);
  const yearlyTrend = bucketMonthlyNet(yearExpenses, YEAR_MONTHS);

  return (
    <RequireAuth>
      <Header title="Charts" />
      <main className="mx-auto max-w-md px-5 py-8 pb-24 md:max-w-2xl lg:max-w-4xl">
        {error && <p className="font-body text-sm text-rust">{error}</p>}

        {loading ? (
          <p className="font-body text-sm text-ink/50">Loading…</p>
        ) : (
          <div className="space-y-5">
            <Card title="Spend by category — this month">
              <CategoryPieChart totals={categoryTotals} />
            </Card>

            <Card title="Spend by card / UPI — this month">
              <InstrumentBarChart totals={instrumentTotals} />
            </Card>

            <Card title="Spend trend — last 6 months">
              <TrendLineChart data={monthlyTrend} />
            </Card>

            <Card title="Spend trend — this year">
              <TrendLineChart data={yearlyTrend} />
            </Card>

            <Card title="Budget vs actual — last 6 months">
              <BudgetVsActualChart data={budgetRows} />
            </Card>
          </div>
        )}
      </main>
      <BottomNav />
    </RequireAuth>
  );
}
