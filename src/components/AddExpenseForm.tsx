"use client";

import { useState } from "react";
import { Instrument, NewExpense } from "@/lib/expenses";
import ExpenseForm from "./ExpenseForm";

export default function AddExpenseForm({
  categories,
  instruments,
  onAdd
}: {
  categories: string[];
  instruments: Instrument[];
  onAdd: (input: NewExpense) => Promise<void>;
}) {
  // No collapse/expand toggle, no Cancel button — this form stays
  // expanded on Home always. `resetKey` remounts the form (fresh default
  // fields) after each save, since there's no "closed" state to return to.
  const [resetKey, setResetKey] = useState(0);

  return (
    <ExpenseForm
      key={resetKey}
      categories={categories}
      instruments={instruments}
      useSlider
      sliderLabel="Slide to log"
      onSubmit={async (input) => {
        await onAdd(input);
        setResetKey((k) => k + 1);
      }}
    />
  );
}
