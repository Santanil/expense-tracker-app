"use client";

import { useState } from "react";
import { Instrument, PAYMENT_METHODS, PaymentMethod } from "@/lib/expenses";
import Select from "./Select";

export default function EditableInstrumentList({
  items,
  onChange,
  placeholder
}: {
  items: Instrument[];
  onChange: (items: Instrument[]) => void;
  placeholder: string;
}) {
  const [newName, setNewName] = useState("");
  const [newMethod, setNewMethod] = useState<PaymentMethod>(PAYMENT_METHODS[0].value);
  const [addError, setAddError] = useState<string | null>(null);

  function handleRename(index: number, name: string) {
    onChange(items.map((item, i) => (i === index ? { ...item, name } : item)));
  }

  function handleMethodChange(index: number, method: PaymentMethod) {
    onChange(items.map((item, i) => (i === index ? { ...item, method } : item)));
  }

  function handleRemove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed) {
      setAddError("Enter a name.");
      return;
    }
    if (items.some((item) => item.name.toLowerCase() === trimmed.toLowerCase())) {
      setAddError("That name is already tied to a method — remove it first to reassign.");
      return;
    }
    onChange([...items, { name: trimmed, method: newMethod }]);
    setNewName("");
    setNewMethod(PAYMENT_METHODS[0].value);
    setAddError(null);
  }

  return (
    <>
      <ul className="mt-4 space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-3">
            <input
              type="text"
              value={item.name}
              onChange={(e) => handleRename(index, e.target.value)}
              className="w-full border-b border-line bg-transparent py-2 font-body text-base text-ink outline-none transition focus:border-ledger"
            />
            <div className="w-36 shrink-0">
              <Select
                value={item.method}
                onChange={(method) => handleMethodChange(index, method)}
                options={PAYMENT_METHODS}
                ariaLabel={`Method for ${item.name}`}
              />
            </div>
            <button
              type="button"
              onClick={() => handleRemove(index)}
              disabled={items.length <= 1}
              className="whitespace-nowrap font-body text-xs text-ink/40 underline decoration-line underline-offset-4 transition hover:text-rust disabled:opacity-30"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center gap-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => {
            setNewName(e.target.value);
            setAddError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder={placeholder}
          className="w-full border-b border-line bg-transparent py-2 font-body text-base text-ink outline-none transition focus:border-ledger"
        />
        <div className="w-36 shrink-0">
          <Select
            value={newMethod}
            onChange={setNewMethod}
            options={PAYMENT_METHODS}
            ariaLabel="Method for new entry"
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="whitespace-nowrap font-body text-xs text-ink underline decoration-line underline-offset-4 transition hover:text-ledger"
        >
          + Add
        </button>
      </div>

      {addError && <p className="mt-3 font-body text-sm text-rust">{addError}</p>}
    </>
  );
}
