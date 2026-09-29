"use client";

import { useState } from "react";

export default function EditableStringList({
  items,
  onChange,
  placeholder
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  const [newItem, setNewItem] = useState("");

  function handleRename(index: number, value: string) {
    onChange(items.map((item, i) => (i === index ? value : item)));
  }

  function handleRemove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function handleAdd() {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setNewItem("");
  }

  return (
    <>
      <ul className="mt-4 space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-3">
            <input
              type="text"
              value={item}
              onChange={(e) => handleRename(index, e.target.value)}
              className="w-full border-b border-line bg-transparent py-2 font-body text-base text-ink outline-none transition focus:border-ledger"
            />
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
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder={placeholder}
          className="w-full border-b border-line bg-transparent py-2 font-body text-base text-ink outline-none transition focus:border-ledger"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="whitespace-nowrap font-body text-xs text-ink underline decoration-line underline-offset-4 transition hover:text-ledger"
        >
          + Add
        </button>
      </div>
    </>
  );
}
