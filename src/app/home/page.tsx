"use client";

import { useCallback, useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import AddExpenseForm from "@/components/AddExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import BudgetPending from "@/components/BudgetPending";
import InstrumentTotals from "@/components/InstrumentTotals";
import Card from "@/components/Card";
import { useAuth } from "@/lib/auth-context";
import {
  Expense,
  Instrument,
  NewExpense,
  PAYMENT_METHODS,
  addExpense,
  deleteExpense,
  fetchExpensesInRange,
  fetchYearTotal,
  formatCurrency,
  getMonthRange,
  getYearRange,
  sumAmounts,
  sumByInstrument,
  updateExpense
} from "@/lib/expenses";
import { Budget, fetchBudget } from "@/lib/budgets";
import { fetchUserCategories, fetchUserInstruments } from "@/lib/settings";

const now = new Date();
const CURRENT_MONTH = now.getMonth() + 1;
const CURRENT_YEAR = now.getFullYear();

export default function HomePage() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const [monthExpenses, setMonthExpenses] = useState<Expense[]>([]);
  const [yearTotal, setYearTotal] = useState(0);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [budget, setBudgetState] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // `showLoading` is false for refetches after add/edit/delete — those
  // should update the numbers/list in place, not replace the whole page
  // with the "Loading…" placeholder like the very first load does (that
  // full-page swap read as the page reloading after sliding to confirm).
  const loadData = useCallback(
    async (showLoading = true) => {
      if (!userId) return;
      if (showLoading) setLoading(true);
      setError(null);
      try {
        const { start: monthStart, end: monthEnd } = getMonthRange();
        const { start: yearStart, end: yearEnd } = getYearRange();

        const [monthData, yearSum, userInstruments, budgetRow, userCategories] = await Promise.all([
          fetchExpensesInRange(userId, monthStart, monthEnd),
          fetchYearTotal(userId, yearStart, yearEnd),
          fetchUserInstruments(userId),
          fetchBudget(userId, CURRENT_MONTH, CURRENT_YEAR),
          fetchUserCategories(userId)
        ]);

        setMonthExpenses(monthData);
        setYearTotal(yearSum);
        setInstruments(userInstruments);
        setBudgetState(budgetRow);
        setCategories(userCategories);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load expenses.");
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleAdd(input: NewExpense) {
    if (!userId) return;
    await addExpense(userId, input);
    await loadData(false);
  }

  async function handleEdit(id: string, input: NewExpense) {
    await updateExpense(id, input);
    await loadData(false);
  }

  async function handleDelete(id: string) {
    await deleteExpense(id);
    await loadData(false);
  }

  const monthTotal = sumAmounts(monthExpenses);
  const recentExpenses = monthExpenses.slice(0, 5);
  const budgetAmount = budget?.budget_amount ?? null;
  const budgetSpentPercent =
    budgetAmount && budgetAmount > 0 ? (monthTotal / budgetAmount) * 100 : 0;
  const budgetOverspent = budgetAmount !== null && monthTotal > budgetAmount;
  const impliedAnnualBudget = budgetAmount !== null ? budgetAmount * 12 : null;
  const yearSpentPercent =
    impliedAnnualBudget && impliedAnnualBudget > 0 ? (yearTotal / impliedAnnualBudget) * 100 : 0;
  const yearOverspent = impliedAnnualBudget !== null && yearTotal > impliedAnnualBudget;
  const methodSections = PAYMENT_METHODS.map((method) => ({
    ...method,
    totals: sumByInstrument(monthExpenses.filter((e) => e.method === method.value))
  }));

  return (
    <RequireAuth>
      <Header title="Home" />
      <main className="mx-auto max-w-md px-5 py-8 pb-24 md:max-w-2xl lg:max-w-4xl">
        {error && <p className="mb-6 font-body text-sm text-rust">{error}</p>}

        {loading ? (
          <p className="font-body text-sm text-ink/50">Loading…</p>
        ) : (
          <div className="space-y-5">
            <Card
              fillPercent={budgetAmount !== null ? budgetSpentPercent : undefined}
              fillColor={budgetOverspent ? "#FF5B4A" : "#2FE6C8"}
            >
              <BudgetPending budgetAmount={budgetAmount} monthTotal={monthTotal} />
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card
                fillPercent={budgetAmount !== null ? budgetSpentPercent : undefined}
                fillColor={budgetOverspent ? "#FF5B4A" : "#2FE6C8"}
              >
                <p className="text-center font-body text-xs text-ink/60">
                  Already spent this month
                </p>
                <p className="mt-1 break-all text-center font-display text-2xl text-ink">
                  {formatCurrency(monthTotal)}
                </p>
              </Card>
              <Card
                fillPercent={impliedAnnualBudget !== null ? yearSpentPercent : undefined}
                fillColor={yearOverspent ? "#FF5B4A" : "#2FE6C8"}
              >
                <p className="text-center font-body text-xs text-ink/60">
                  Already spent this year
                </p>
                <p className="mt-1 break-all text-center font-display text-2xl text-ink">
                  {formatCurrency(yearTotal)}
                </p>
              </Card>
            </div>

            <Card>
              <AddExpenseForm
                categories={categories}
                instruments={instruments}
                onAdd={handleAdd}
              />
            </Card>

            <Card title="Recent transactions">
              <ExpenseList
                expenses={recentExpenses}
                categories={categories}
                instruments={instruments}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </Card>

            {methodSections
              .filter((section) => section.totals.length > 0)
              .map((section) => (
                <Card key={section.value} title={`${section.label} — this month`}>
                  <InstrumentTotals totals={section.totals} />
                </Card>
              ))}
          </div>
        )}
      </main>
      <BottomNav />
    </RequireAuth>
  );
}
