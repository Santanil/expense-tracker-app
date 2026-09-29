"use client";

import { useState } from "react";
import { Expense, Instrument, NewExpense, formatCurrency, formatDate } from "@/lib/expenses";
import ExpenseForm from "./ExpenseForm";
import CategoryBadge from "./CategoryBadge";

const COLUMN_COUNT = 8;

export default function ExpenseTable({
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
      <p className="font-body text-sm text-ink/50">No expenses logged this month yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse font-body text-xs">
        <thead>
          <tr className="border-b border-line text-center text-ink/60">
            <th className="whitespace-nowrap py-2 pr-4 font-normal">Date</th>
            <th className="whitespace-nowrap py-2 pr-4 font-normal">Category</th>
            <th className="whitespace-nowrap py-2 pr-4 font-normal">Description</th>
            <th className="whitespace-nowrap py-2 pr-4 font-normal">Spend type</th>
            <th className="whitespace-nowrap py-2 pr-4 font-normal">Method</th>
            <th className="whitespace-nowrap py-2 pr-4 font-normal">Card/Upi/Wallet/Bank Name</th>
            <th className="whitespace-nowrap py-2 pr-4 font-normal">Amount</th>
            <th className="whitespace-nowrap py-2 font-normal"></th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) =>
            editingId === expense.id ? (
              <tr key={expense.id} className="border-b border-line">
                <td colSpan={COLUMN_COUNT} className="py-4">
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
                </td>
              </tr>
            ) : (
              <tr key={expense.id} className="border-b border-line text-center text-ink">
                <td className="whitespace-nowrap py-3 pr-4">{formatDate(expense.date)}</td>
                <td className="whitespace-nowrap py-3 pr-4">
                  <CategoryBadge category={expense.category} />
                </td>
                <td className="max-w-[160px] truncate py-3 pr-4 text-ink/70">
                  {expense.description || "—"}
                </td>
                <td className="whitespace-nowrap py-3 pr-4 capitalize">{expense.spend_type}</td>
                <td className="whitespace-nowrap py-3 pr-4 capitalize">
                  {expense.method.replace("_", " ")}
                </td>
                <td className="whitespace-nowrap py-3 pr-4">
                  {expense.instrument_name || "—"}
                </td>
                <td className="whitespace-nowrap py-3 pr-4">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="whitespace-nowrap py-3">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setEditingId(expense.id)}
                      className="text-ink/40 underline decoration-line underline-offset-4 transition hover:text-ink"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      disabled={deletingId === expense.id}
                      className="text-ink/40 underline decoration-line underline-offset-4 transition hover:text-rust disabled:opacity-50"
                    >
                      {deletingId === expense.id ? "…" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
