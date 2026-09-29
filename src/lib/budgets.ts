import { supabase } from "./supabaseClient";

export type Budget = {
  id: string;
  user_id: string;
  month: number;
  year: number;
  budget_amount: number;
  created_at: string;
};

export async function fetchBudget(userId: string, month: number, year: number) {
  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", userId)
    .eq("month", month)
    .eq("year", year)
    .maybeSingle();

  if (error) throw error;
  return data as Budget | null;
}

export async function fetchAllBudgets(userId: string) {
  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return data as Budget[];
}

export async function setBudget(
  userId: string,
  month: number,
  year: number,
  amount: number
) {
  const { data, error } = await supabase
    .from("budgets")
    .upsert(
      { user_id: userId, month, year, budget_amount: amount },
      { onConflict: "user_id,month,year" }
    )
    .select()
    .single();

  if (error) throw error;
  return data as Budget;
}
