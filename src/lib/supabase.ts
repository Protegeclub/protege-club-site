import { createClient } from "@supabase/supabase-js";

export function getSupabaseClient(url: string, serviceRoleKey: string) {
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase URL/service role key not configured");
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
