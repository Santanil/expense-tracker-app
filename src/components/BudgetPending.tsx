import { formatCurrency } from "@/lib/expenses";

export default function BudgetPending({
  budgetAmount,
  monthTotal
}: {
  budgetAmount: number | null;
  monthTotal: number;
}) {
  if (budgetAmount === null) {
    return (
      <div className="text-center">
        <p className="font-body text-sm text-ink/60">
          No budget set for this month — set one in Settings.
        </p>
      </div>
    );
  }

  const pending = budgetAmount - monthTotal;
  const overspent = pending < 0;

  return (
    <div className="text-center">
      <p className="font-body text-xs text-ink/60">
        {overspent ? "Over budget" : "Budget pending for this month"}
      </p>
      <p
        className={
          "mt-1 break-all font-display text-3xl " + (overspent ? "text-rust" : "text-ink")
        }
      >
        {formatCurrency(Math.abs(pending))}
      </p>
    </div>
  );
}
