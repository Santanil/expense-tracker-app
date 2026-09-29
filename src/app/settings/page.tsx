"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import EditableStringList from "@/components/EditableStringList";
import EditableInstrumentList from "@/components/EditableInstrumentList";
import Card from "@/components/Card";
import { useAuth } from "@/lib/auth-context";
import { Instrument } from "@/lib/expenses";
import {
  fetchUserCategories,
  fetchUserInstruments,
  setUserCategories,
  setUserInstruments
} from "@/lib/settings";
import { fetchBudget, setBudget } from "@/lib/budgets";

const now = new Date();
const CURRENT_MONTH = now.getMonth() + 1;
const CURRENT_YEAR = now.getFullYear();
const CURRENT_MONTH_LABEL = new Date(CURRENT_YEAR, CURRENT_MONTH - 1, 1).toLocaleDateString(
  "en-IN",
  { month: "long", year: "numeric" }
);

export default function SettingsPage() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesSaving, setCategoriesSaving] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [categoriesSaved, setCategoriesSaved] = useState(false);

  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [instrumentsSaving, setInstrumentsSaving] = useState(false);
  const [instrumentsError, setInstrumentsError] = useState<string | null>(null);
  const [instrumentsSaved, setInstrumentsSaved] = useState(false);

  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetSaving, setBudgetSaving] = useState(false);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [budgetSaved, setBudgetSaved] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [userCategories, userInstruments, budgetRow] = await Promise.all([
        fetchUserCategories(userId),
        fetchUserInstruments(userId),
        fetchBudget(userId, CURRENT_MONTH, CURRENT_YEAR)
      ]);
      setCategories(userCategories);
      setInstruments(userInstruments);
      setBudgetAmount(budgetRow ? String(budgetRow.budget_amount) : "");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load settings.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSaveCategories() {
    if (!userId) return;
    const cleaned = categories.map((c) => c.trim()).filter((c) => c.length > 0);
    if (cleaned.length === 0) {
      setCategoriesError("Keep at least one category.");
      return;
    }

    setCategoriesSaving(true);
    setCategoriesError(null);
    try {
      const saved = await setUserCategories(userId, cleaned);
      setCategories(saved);
      setCategoriesSaved(true);
    } catch (err) {
      setCategoriesError(err instanceof Error ? err.message : "Could not save categories.");
    } finally {
      setCategoriesSaving(false);
    }
  }

  async function handleSaveInstruments() {
    if (!userId) return;
    const cleaned = instruments
      .map((i) => ({ ...i, name: i.name.trim() }))
      .filter((i) => i.name.length > 0);
    if (cleaned.length === 0) {
      setInstrumentsError("Keep at least one card/UPI/wallet/bank name.");
      return;
    }
    const lowerNames = cleaned.map((i) => i.name.toLowerCase());
    if (new Set(lowerNames).size !== lowerNames.length) {
      setInstrumentsError("Each name can only be tied to one method — remove the duplicate.");
      return;
    }

    setInstrumentsSaving(true);
    setInstrumentsError(null);
    try {
      const saved = await setUserInstruments(userId, cleaned);
      setInstruments(saved);
      setInstrumentsSaved(true);
    } catch (err) {
      setInstrumentsError(
        err instanceof Error ? err.message : "Could not save card/UPI/wallet/bank names."
      );
    } finally {
      setInstrumentsSaving(false);
    }
  }

  async function handleSaveBudget(e: FormEvent) {
    e.preventDefault();
    if (!userId) return;
    const numericAmount = Number(budgetAmount);
    if (!numericAmount || numericAmount <= 0) {
      setBudgetError("Enter a budget greater than zero.");
      return;
    }

    setBudgetSaving(true);
    setBudgetError(null);
    try {
      await setBudget(userId, CURRENT_MONTH, CURRENT_YEAR, numericAmount);
      setBudgetSaved(true);
    } catch (err) {
      setBudgetError(err instanceof Error ? err.message : "Could not save budget.");
    } finally {
      setBudgetSaving(false);
    }
  }

  return (
    <RequireAuth>
      <Header title="Settings" />
      <main className="mx-auto max-w-md px-5 py-8 pb-24 md:max-w-2xl lg:max-w-4xl">
        {loadError && <p className="mb-6 font-body text-sm text-rust">{loadError}</p>}

        {loading ? (
          <p className="font-body text-sm text-ink/50">Loading…</p>
        ) : (
          <div className="space-y-5">
            <Card title="Monthly budget">
              <p className="font-body text-xs text-ink/40">For {CURRENT_MONTH_LABEL}.</p>

              <form onSubmit={handleSaveBudget} className="mt-4">
                <label className="block">
                  <span className="font-body text-xs text-ink/60">Amount</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={budgetAmount}
                    onChange={(e) => {
                      setBudgetAmount(e.target.value);
                      setBudgetSaved(false);
                    }}
                    placeholder="0"
                    className="mt-1 w-full border-b border-line bg-transparent py-2 font-body text-base text-ink outline-none transition focus:border-ledger"
                  />
                </label>

                {budgetError && (
                  <p className="mt-3 font-body text-sm text-rust">{budgetError}</p>
                )}
                {budgetSaved && !budgetError && (
                  <p className="mt-3 font-body text-sm text-ledger">Saved.</p>
                )}

                <button
                  type="submit"
                  disabled={budgetSaving}
                  className="btn-glow mt-6 w-full bg-ink py-3 font-body text-sm text-paper transition hover:bg-ledger disabled:opacity-60"
                >
                  {budgetSaving ? "Saving…" : "Save budget"}
                </button>
              </form>
            </Card>

            <Card title="Categories">
              <p className="font-body text-xs text-ink/40">
                Used in the Category dropdown when adding an expense.
              </p>

              <EditableStringList
                items={categories}
                onChange={(next) => {
                  setCategories(next);
                  setCategoriesSaved(false);
                }}
                placeholder="Add a category"
              />

              {categoriesError && (
                <p className="mt-3 font-body text-sm text-rust">{categoriesError}</p>
              )}
              {categoriesSaved && !categoriesError && (
                <p className="mt-3 font-body text-sm text-ledger">Saved.</p>
              )}

              <button
                type="button"
                onClick={handleSaveCategories}
                disabled={categoriesSaving}
                className="btn-glow mt-6 w-full bg-ink py-3 font-body text-sm text-paper transition hover:bg-ledger disabled:opacity-60"
              >
                {categoriesSaving ? "Saving…" : "Save categories"}
              </button>
            </Card>

            <Card title="Card/Upi/Wallet/Bank Names">
              <p className="font-body text-xs text-ink/40">
                Used in the Card/Upi/Wallet/Bank Name dropdown when adding an expense. Each
                name is tied to one Method, and only shows up when that Method is selected.
              </p>

              <EditableInstrumentList
                items={instruments}
                onChange={(next) => {
                  setInstruments(next);
                  setInstrumentsSaved(false);
                }}
                placeholder="Add a card/UPI/wallet/bank name"
              />

              {instrumentsError && (
                <p className="mt-3 font-body text-sm text-rust">{instrumentsError}</p>
              )}
              {instrumentsSaved && !instrumentsError && (
                <p className="mt-3 font-body text-sm text-ledger">Saved.</p>
              )}

              <button
                type="button"
                onClick={handleSaveInstruments}
                disabled={instrumentsSaving}
                className="btn-glow mt-6 w-full bg-ink py-3 font-body text-sm text-paper transition hover:bg-ledger disabled:opacity-60"
              >
                {instrumentsSaving ? "Saving…" : "Save card/UPI/wallet/bank names"}
              </button>
            </Card>
          </div>
        )}
      </main>
      <BottomNav />
    </RequireAuth>
  );
}
