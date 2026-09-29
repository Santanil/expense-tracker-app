import { InstrumentTotal, formatCurrency } from "@/lib/expenses";

// Caller (home/page.tsx) filters out empty sections before rendering this,
// so `totals` is always non-empty here.
export default function InstrumentTotals({ totals }: { totals: InstrumentTotal[] }) {
  return (
    <ul className="divide-y divide-line">
      {totals.map(({ instrumentName, total }) => (
        <li key={instrumentName} className="flex items-center justify-between py-3">
          <span className="font-body text-sm text-ink">{instrumentName}</span>
          <span className="font-body text-sm text-ink">{formatCurrency(total)}</span>
        </li>
      ))}
    </ul>
  );
}
