import { supabase } from "./supabaseClient";

export type SpendType = "credit" | "debit";
export type PaymentMethod = "card" | "upi" | "wallet" | "bank_transfer";

export type Expense = {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  category: string;
  description: string | null;
  spend_type: SpendType;
  method: PaymentMethod;
  instrument_name: string | null;
  amount: number;
  created_at: string;
};

export type NewExpense = {
  date: string;
  category: string;
  description: string;
  spend_type: SpendType;
  method: PaymentMethod;
  instrument_name: string;
  amount: number;
};

// A Card/UPI/Wallet/Bank Transfer name is always tied to exactly one
// Method — see src/lib/settings.ts for how the list of these is stored
// per-user.
export type Instrument = {
  name: string;
  method: PaymentMethod;
};

// Default/seed category list — a user's actual list lives in
// `user_settings.categories` (see src/lib/settings.ts) and can be
// customized on the Settings tab. This is only the fallback for
// users who haven't customized it yet.
export const CATEGORIES = [
  "Food",
  "Travel",
  "Rent",
  "Utilities",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Other"
] as const;

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "card", label: "Card" },
  { value: "upi", label: "UPI" },
  { value: "wallet", label: "Wallet" },
  { value: "bank_transfer", label: "Bank Transfer" }
];

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function getMonthRange(reference = new Date()) {
  const start = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 0);
  return { start: toISODate(start), end: toISODate(end) };
}

export function getYearRange(reference = new Date()) {
  const start = new Date(reference.getFullYear(), 0, 1);
  const end = new Date(reference.getFullYear(), 11, 31);
  return { start: toISODate(start), end: toISODate(end) };
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short"
  });
}

// Credit entries are money coming back (refund/cashback), so they reduce net
// spend instead of adding to it.
export function netAmount(expense: { amount: number; spend_type: SpendType }) {
  return expense.spend_type === "credit" ? -expense.amount : expense.amount;
}

export function sumAmounts(expenses: Expense[]) {
  return expenses.reduce((total, e) => total + netAmount(e), 0);
}

export type InstrumentTotal = {
  instrumentName: string;
  total: number;
};

export function sumByInstrument(expenses: Expense[]): InstrumentTotal[] {
  const totals = new Map<string, number>();
  for (const expense of expenses) {
    const key = expense.instrument_name?.trim() || "Unspecified";
    totals.set(key, (totals.get(key) ?? 0) + netAmount(expense));
  }
  return Array.from(totals, ([instrumentName, total]) => ({ instrumentName, total })).sort(
    (a, b) => b.total - a.total
  );
}

export type CategoryTotal = {
  category: string;
  total: number;
};

export function sumByCategory(expenses: Expense[]): CategoryTotal[] {
  const totals = new Map<string, number>();
  for (const expense of expenses) {
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + netAmount(expense));
  }
  return Array.from(totals, ([category, total]) => ({ category, total })).sort(
    (a, b) => b.total - a.total
  );
}

export async function fetchExpensesInRange(
  userId: string,
  from: string,
  to: string
) {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", userId)
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Expense[];
}

export async function fetchAllExpenses(userId: string) {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Expense[];
}

// Free-text search across every field a transaction has — used by the
// all-time search on the Breakdown tab, not just whatever columns a
// table happens to display.
export function expenseMatchesQuery(expense: Expense, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;

  const fields = [
    expense.category,
    expense.description ?? "",
    expense.spend_type,
    expense.method.replace("_", " "),
    expense.instrument_name ?? "",
    formatDate(expense.date),
    expense.date,
    String(expense.amount)
  ];

  return fields.some((field) => field.toLowerCase().includes(q));
}

export async function fetchYearTotal(userId: string, from: string, to: string) {
  const { data, error } = await supabase
    .from("expenses")
    .select("amount, spend_type")
    .eq("user_id", userId)
    .gte("date", from)
    .lte("date", to);

  if (error) throw error;
  return (data as { amount: number; spend_type: SpendType }[]).reduce(
    (total, row) => total + netAmount(row),
    0
  );
}

// Seeds the per-user Settings list for a user who hasn't customized it yet,
// pairing each distinct instrument_name with whichever method it was most
// recently logged under (rows are already ordered newest-first, so the
// first occurrence of a name wins).
export async function fetchRecentInstruments(userId: string): Promise<Instrument[]> {
  const { data, error } = await supabase
    .from("expenses")
    .select("instrument_name, method")
    .eq("user_id", userId)
    .not("instrument_name", "is", null)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw error;
  const seen = new Set<string>();
  const instruments: Instrument[] = [];
  for (const row of data as { instrument_name: string | null; method: PaymentMethod }[]) {
    const name = row.instrument_name?.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    instruments.push({ name, method: row.method });
  }
  return instruments;
}

export async function addExpense(userId: string, input: NewExpense) {
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      user_id: userId,
      date: input.date,
      category: input.category,
      description: input.description || null,
      spend_type: input.spend_type,
      method: input.method,
      instrument_name: input.instrument_name || null,
      amount: input.amount
    })
    .select()
    .single();

  if (error) throw error;
  return data as Expense;
}

export async function updateExpense(id: string, input: NewExpense) {
  const { data, error } = await supabase
    .from("expenses")
    .update({
      date: input.date,
      category: input.category,
      description: input.description || null,
      spend_type: input.spend_type,
      method: input.method,
      instrument_name: input.instrument_name || null,
      amount: input.amount
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Expense;
}

export async function deleteExpense(id: string) {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}
