"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function Select<T extends string>({
  value,
  onChange,
  options,
  ariaLabel
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      // The listbox renders through a portal, so it's outside rootRef's own
      // DOM subtree — without also checking listRef here, a mousedown on an
      // option reads as "outside" and closes the list before its onClick
      // (which fires later, on mouseup) ever gets to run the selection.
      if (
        rootRef.current &&
        !rootRef.current.contains(target) &&
        !listRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    // The listbox renders through a portal (see below) so it can float above
    // sibling Cards instead of being trapped inside this Select's own Card's
    // stacking context — track the trigger's position so the portaled
    // listbox still lines up under it, including while the page scrolls.
    function updateRect() {
      const r = buttonRef.current?.getBoundingClientRect();
      if (r) setRect({ top: r.bottom + 4, left: r.left, width: r.width });
    }
    updateRect();

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={rootRef} className="relative mt-1">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className="flex w-full items-center justify-between border-b border-line bg-transparent py-2 text-left font-body text-base text-ink outline-none transition focus:border-ledger"
      >
        <span>{selected?.label ?? ""}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`shrink-0 text-ink/50 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open &&
        rect &&
        createPortal(
          <ul
            ref={listRef}
            role="listbox"
            style={{ top: rect.top, left: rect.left, width: rect.width }}
            className="fixed z-30 max-h-60 overflow-auto border border-line bg-paper"
          >
            {options.map((option) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`cursor-pointer px-3 py-2 font-body text-sm transition ${
                  option.value === value ? "bg-line/50 text-ink" : "text-ink/80 hover:bg-line/30"
                }`}
              >
                {option.label}
              </li>
            ))}
          </ul>,
          document.body
        )}
    </div>
  );
}
