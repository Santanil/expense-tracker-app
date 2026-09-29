import { supabase } from "./supabaseClient";

export type AssetType = "FD" | "MF" | "PF" | "PPF" | "Stocks" | "Bonds" | "RSU" | "ESPP";
export type AssetStatus = "Active" | "Dormant" | "Closed";

export type Asset = {
  id: string;
  user_id: string;
  asset_name: string;
  asset_type: AssetType;
  status: AssetStatus;
  start_date: string | null;
  end_date: string | null;
  account_number: string | null;
  amount_invested: number;
  amount_expected_maturity: number | null;
  created_at: string;
};

export type NewAsset = {
  asset_name: string;
  asset_type: AssetType;
  status: AssetStatus;
  start_date: string;
  end_date: string;
  account_number: string;
  amount_invested: number;
  amount_expected_maturity: string;
};

export const ASSET_TYPES: AssetType[] = [
  "FD",
  "MF",
  "PF",
  "PPF",
  "Stocks",
  "Bonds",
  "RSU",
  "ESPP"
];

export const ASSET_STATUSES: AssetStatus[] = ["Active", "Dormant", "Closed"];

export async function fetchAssets(userId: string) {
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Asset[];
}

export async function addAsset(userId: string, input: NewAsset) {
  const { data, error } = await supabase
    .from("assets")
    .insert({
      user_id: userId,
      asset_name: input.asset_name,
      asset_type: input.asset_type,
      status: input.status,
      start_date: input.start_date || null,
      end_date: input.end_date || null,
      account_number: input.account_number || null,
      amount_invested: input.amount_invested,
      amount_expected_maturity: input.amount_expected_maturity
        ? Number(input.amount_expected_maturity)
        : null
    })
    .select()
    .single();

  if (error) throw error;
  return data as Asset;
}

export async function updateAsset(id: string, input: NewAsset) {
  const { data, error } = await supabase
    .from("assets")
    .update({
      asset_name: input.asset_name,
      asset_type: input.asset_type,
      status: input.status,
      start_date: input.start_date || null,
      end_date: input.end_date || null,
      account_number: input.account_number || null,
      amount_invested: input.amount_invested,
      amount_expected_maturity: input.amount_expected_maturity
        ? Number(input.amount_expected_maturity)
        : null
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Asset;
}

export async function deleteAsset(id: string) {
  const { error } = await supabase.from("assets").delete().eq("id", id);
  if (error) throw error;
}

export function sumInvested(assets: Asset[]) {
  return assets.reduce((total, a) => total + a.amount_invested, 0);
}

export function sumExpectedMaturity(assets: Asset[]) {
  return assets.reduce((total, a) => total + (a.amount_expected_maturity ?? 0), 0);
}
