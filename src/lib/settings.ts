import { supabase } from "./supabaseClient";
import { CATEGORIES as DEFAULT_CATEGORIES, fetchRecentInstruments, Instrument } from "./expenses";

const DEFAULT_INSTRUMENTS: Instrument[] = [{ name: "Cash", method: "wallet" }];

export async function fetchUserCategories(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("user_settings")
    .select("categories")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data?.categories ?? [...DEFAULT_CATEGORIES];
}

export async function setUserCategories(userId: string, categories: string[]) {
  const { data, error } = await supabase
    .from("user_settings")
    .upsert({ user_id: userId, categories }, { onConflict: "user_id" })
    .select("categories")
    .single();

  if (error) throw error;
  return data.categories as string[];
}

export async function fetchUserInstruments(userId: string): Promise<Instrument[]> {
  const { data, error } = await supabase
    .from("user_settings")
    .select("instruments")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (data?.instruments && data.instruments.length > 0) {
    return data.instruments;
  }

  // Not customized yet — seed from past entries so the dropdown isn't
  // empty for an existing user, falling back to a generic default for a
  // brand-new user with no history at all.
  const recent = await fetchRecentInstruments(userId);
  return recent.length > 0 ? recent : [...DEFAULT_INSTRUMENTS];
}

export async function setUserInstruments(userId: string, instruments: Instrument[]) {
  const { data, error } = await supabase
    .from("user_settings")
    .upsert({ user_id: userId, instruments }, { onConflict: "user_id" })
    .select("instruments")
    .single();

  if (error) throw error;
  return data.instruments as Instrument[];
}
