"use client";

import { useCallback, useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ExpenseTable from "@/components/ExpenseTable";
import Card from "@/components/Card";
import { useAuth } from "@/lib/auth-context";
import {
  Expense,
  Instrument,
  NewExpense,
  deleteExpense,
  expenseMatchesQuery,
  fetchAllExpenses,
  fetchExpensesInRange,
  formatCurrency,
  getMonthRange,
  sumAmounts,
  updateExpense
} from "@/lib/expenses";
import { downloadExpensesPdf } from "@/lib/pdf";
import { fetchUserCategories, fetchUserInstruments } from "@/lib/settings";

function currentMonthValue() {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

export default function HistoryPage() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const [monthValue, setMonthValue] = useState(currentMonthValue());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [allLoading, setAllLoading] = useState(true);
  const [search, setSearch] = useState("");

  // `showLoading` is false for refetches after edit/delete — those should
  // update the table in place, not replace it with the "Loading…"
  // placeholder like the very first load / month-switch does.
  const loadData = useCallback(
    async (showLoading = true) => {
      if (!userId) return;
      if (showLoading) setLoading(true);
      setError(null);
      try {
        const [year, month] = monthValue.split("-").map(Number);
        const { start, end } = getMonthRange(new Date(year, month - 1, 1));

        const [data, userInstruments, userCategories] = await Promise.all([
          fetchExpensesInRange(userId, start, end),
          fetchUserInstruments(userId),
          fetchUserCategories(userId)
        ]);

        setExpenses(data);
        setInstruments(userInstruments);
        setCategories(userCategories);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load expenses.");
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [userId, monthValue]
  );

  const loadAllExpenses = useCallback(
    async (showLoading = true) => {
      if (!userId) return;
      if (showLoading) setAllLoading(true);
      try {
        const data = await fetchAllExpenses(userId);
        setAllExpenses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load expenses.");
      } finally {
        if (showLoading) setAllLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadAllExpenses();
  }, [loadAllExpenses]);

  async function handleEdit(id: string, input: NewExpense) {
    await updateExpense(id, input);
    await Promise.all([loadData(false), loadAllExpenses(false)]);
  }

  async function handleDelete(id: string) {
    await deleteExpense(id);
    await Promise.all([loadData(false), loadAllExpenses(false)]);
  }

  const searchResults = search.trim()
    ? allExpenses.filter((e) => expenseMatchesQuery(e, search))
    : [];

  const total = sumAmounts(expenses);
  const [year, month] = monthValue.split("-").map(Number);
  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric"
  });

  function handleDownloadPdf() {
    downloadExpensesPdf(expenses, monthLabel);
  }

  return (
    <RequireAuth>
      <Header title="Monthly breakdown" />
      <main className="mx-auto max-w-md px-5 py-8 pb-24 md:max-w-2xl lg:max-w-4xl">
        <div className="space-y-5">
          <Card title="Search transactions">
            <label className="block">
              <span className="font-body text-xs text-ink/60">Search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by category, description, amount, method…"
                className="mt-1 w-full border-b border-line bg-transparent py-2 font-body text-base text-ink outline-none transition focus:border-ledger"
              />
            </label>

            <div className="mt-6">
              {!search.trim() ? (
                <p className="font-body text-sm text-ink/50">
                  Type to search across every transaction you've logged — not just this
                  month.
                </p>
              ) : allLoading ? (
                <p className="font-body text-sm text-ink/50">Loading…</p>
              ) : searchResults.length === 0 ? (
                <p className="font-body text-sm text-ink/50">No matching transactions.</p>
              ) : (
                <ExpenseTable
                  expenses={searchResults}
                  categories={categories}
                  instruments={instruments}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </Card>

          <Card>
            <label className="block">
              <span className="font-body text-xs text-ink/60">Month</span>
              <input
                type="month"
                value={monthValue}
                onChange={(e) => setMonthValue(e.target.value)}
                className="mt-1 w-full border-b border-line bg-transparent py-2 font-body text-base text-ink outline-none transition focus:border-ledger"
              />
            </label>

            <div className="mt-6 flex items-end justify-between">
              <div>
                <p className="font-body text-xs text-ink/60">Total spend</p>
                <p className="mt-1 font-display text-3xl text-ink">
                  {formatCurrency(total)}
                </p>
              </div>
              <button
                onClick={handleDownloadPdf}
                disabled={expenses.length === 0}
                className="font-body text-sm text-ink underline decoration-line underline-offset-4 transition hover:text-ledger disabled:opacity-40"
              >
                Download PDF
              </button>
            </div>

            {error && <p className="mt-6 font-body text-sm text-rust">{error}</p>}

            <div className="mt-6 flex items-center justify-between border-b border-line pb-3">
              <h2 className="font-body text-xs text-ink/60">Transactions</h2>
            </div>
            <div className="pt-4">
              {loading ? (
                <p className="font-body text-sm text-ink/50">Loading…</p>
              ) : (
                <ExpenseTable
                  expenses={expenses}
                  categories={categories}
                  instruments={instruments}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </Card>
        </div>
      </main>
      <BottomNav />
    </RequireAuth>
  );
}
