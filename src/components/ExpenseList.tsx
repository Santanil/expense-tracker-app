"use client";

import { useState } from "react";
import { Expense, Instrument, NewExpense, formatCurrency, formatDate } from "@/lib/expenses";
import ExpenseForm from "./ExpenseForm";
import CategoryBadge from "./CategoryBadge";

export default function ExpenseList({
  expenses,
  categories,
  instruments,
  onEdit,
  onDelete
}: {
  expenses: Expense[];
  categories: string[];
  instruments: Instrument[];
  onEdit: (id: string, input: NewExpense) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  }

  if (expenses.length === 0) {
    return (
      <p className="font-body text-sm text-ink/50">
        No expenses logged this month yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-line">
      {expenses.map((expense) => (
        <li key={expense.id} className="py-4">
          {editingId === expense.id ? (
            <ExpenseForm
              initial={{
                date: expense.date,
                category: expense.category,
                description: expense.description ?? "",
                spend_type: expense.spend_type,
                method: expense.method,
                instrument_name: expense.instrument_name ?? "",
                amount: expense.amount
              }}
              categories={categories}
              instruments={instruments}
              submitLabel="Save changes"
              onSubmit={async (input) => {
                await onEdit(expense.id, input);
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col items-start gap-1.5">
                <CategoryBadge category={expense.category} />
                <div className="flex flex-wrap items-center gap-3 text-xs text-ink/50">
                  <span>{formatDate(expense.date)}</span>
                  {expense.instrument_name && <span>{expense.instrument_name}</span>}
                  {expense.description && <span>{expense.description}</span>}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-body text-sm text-ink">
                  {formatCurrency(expense.amount)}
                </span>
                <button
                  onClick={() => setEditingId(expense.id)}
                  className="font-body text-xs text-ink/40 underline decoration-line underline-offset-4 transition hover:text-ink"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(expense.id)}
                  disabled={deletingId === expense.id}
                  className="font-body text-xs text-ink/40 underline decoration-line underline-offset-4 transition hover:text-rust disabled:opacity-50"
                >
                  {deletingId === expense.id ? "…" : "Delete"}
                </button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
