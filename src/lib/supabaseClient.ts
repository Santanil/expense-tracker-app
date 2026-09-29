import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Loud, early failure is better than a silent broken app —
  // this almost always means .env.local hasn't been filled in yet.
  console.warn(
    "Supabase environment variables are missing. Copy .env.local.example to .env.local and fill in your project values."
  );
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");
