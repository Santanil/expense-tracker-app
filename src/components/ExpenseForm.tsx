"use client";

import { FormEvent, useRef, useState } from "react";
import { PAYMENT_METHODS, NewExpense, SpendType, PaymentMethod, Instrument } from "@/lib/expenses";
import Select from "./Select";
import SlideToConfirm, { SlideToConfirmHandle } from "./SlideToConfirm";

const SPEND_TYPE_OPTIONS: { value: SpendType; label: string }[] = [
  { value: "debit", label: "Debit" },
  { value: "credit", label: "Credit" }
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function ExpenseForm({
  initial,
  categories,
  instruments,
  submitLabel = "Save",
  useSlider = false,
  sliderLabel = "Slide to log",
  onSubmit,
  onCancel
}: {
  initial?: NewExpense;
  categories: string[];
  instruments: Instrument[];
  submitLabel?: string;
  useSlider?: boolean;
  sliderLabel?: string;
  onSubmit: (input: NewExpense) => Promise<void>;
  onCancel?: () => void;
}) {
  // Default to whichever Method the first configured instrument actually
  // belongs to — defaulting to a fixed Method (e.g. "upi") regardless of
  // what's configured could leave the Card/Upi/Wallet/Bank Name dropdown
  // with zero options on first load (e.g. a fresh account only seeded
  // with a "Cash" / wallet instrument).
  const defaultMethod: PaymentMethod = instruments[0]?.method ?? "upi";
  const start: NewExpense = initial ?? {
    date: todayISO(),
    category: categories[0] ?? "",
    description: "",
    spend_type: "debit",
    method: defaultMethod,
    instrument_name: instruments.find((i) => i.method === defaultMethod)?.name ?? "",
    amount: 0
  };
  const [date, setDate] = useState(start.date);
  const [category, setCategory] = useState<string>(start.category);
  const [description, setDescription] = useState(start.description);
  const [spendType, setSpendType] = useState<SpendType>(start.spend_type);
  const [method, setMethod] = useState<PaymentMethod>(start.method);
  const [instrumentName, setInstrumentName] = useState(start.instrument_name);
  const [amount, setAmount] = useState(start.amount ? String(start.amount) : "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const sliderRef = useRef<SlideToConfirmHandle>(null);

  // Editing older data whose category/instrument name was since renamed
  // or removed from Settings shouldn't make the Select show blank.
  const categoryOptions =
    category && !categories.includes(category) ? [category, ...categories] : categories;

  // An instrument name is always tied to exactly one Method (that's the
  // whole point of this list), so only offer names configured for the
  // currently selected Method — never the full cross-method list.
  const namesForMethod = instruments.filter((i) => i.method === method).map((i) => i.name);
  const instrumentNameOptions =
    instrumentName && !namesForMethod.includes(instrumentName)
      ? [instrumentName, ...namesForMethod]
      : namesForMethod;

  function handleMethodChange(nextMethod: PaymentMethod) {
    setMethod(nextMethod);
    // The previously selected name almost certainly belongs to the old
    // Method, so switch to the first name configured for the new one
    // (or blank it if none are configured yet) rather than leaving a
    // mismatched name/method pair in place.
    const firstForNextMethod = instruments.find((i) => i.method === nextMethod)?.name ?? "";
    setInstrumentName(firstForNextMethod);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError("Enter an amount greater than zero.");
      sliderRef.current?.reset();
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        date,
        category,
        description,
        spend_type: spendType,
        method,
        instrument_name: instrumentName,
        amount: numericAmount
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save expense.");
      sliderRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="font-body text-xs text-ink/60">Date</span>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full border-b border-line bg-transparent py-2 font-body text-base text-ink outline-none transition focus:border-ledger"
          />
        </label>

        <label className="block">
          <span className="font-body text-xs text-ink/60">Amount</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="mt-1 w-full border-b border-line bg-transparent py-2 font-body text-base text-ink outline-none transition focus:border-ledger"
          />
        </label>
      </div>

      <div className="block">
        <span className="font-body text-xs text-ink/60">Category</span>
        <Select
          value={category}
          onChange={setCategory}
          options={categoryOptions.map((c) => ({ value: c, label: c }))}
          ariaLabel="Category"
        />
      </div>

      <label className="block">
        <span className="font-body text-xs text-ink/60">Description</span>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional"
          className="mt-1 w-full border-b border-line bg-transparent py-2 font-body text-base text-ink outline-none transition focus:border-ledger"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <div className="block">
          <span className="font-body text-xs text-ink/60">Spend type</span>
          <Select
            value={spendType}
            onChange={setSpendType}
            options={SPEND_TYPE_OPTIONS}
            ariaLabel="Spend type"
          />
        </div>

        <div className="block">
          <span className="font-body text-xs text-ink/60">Method</span>
          <Select
            value={method}
            onChange={handleMethodChange}
            options={PAYMENT_METHODS}
            ariaLabel="Method"
          />
        </div>
      </div>

      <div className="block">
        <span className="font-body text-xs text-ink/60">Card/Upi/Wallet/Bank Name</span>
        <Select
          value={instrumentName}
          onChange={setInstrumentName}
          options={instrumentNameOptions.map((n) => ({ value: n, label: n }))}
          ariaLabel="Card/Upi/Wallet/Bank Name"
        />
      </div>

      {error && <p className="font-body text-sm text-rust">{error}</p>}

      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-line py-3 font-body text-sm text-ink/60 transition hover:text-ink"
          >
            Cancel
          </button>
        )}
        {useSlider ? (
          <div className="mx-auto w-4/5">
            <SlideToConfirm
              ref={sliderRef}
              label={sliderLabel}
              disabled={submitting}
              onConfirm={() => formRef.current?.requestSubmit()}
            />
          </div>
        ) : (
          <button
            type="submit"
            disabled={submitting}
            className="btn-glow flex-1 bg-ink py-3 font-body text-sm text-paper transition hover:bg-ledger disabled:opacity-60"
          >
            {submitting ? "Saving…" : submitLabel}
          </button>
        )}
      </div>
    </form>
  );
}
