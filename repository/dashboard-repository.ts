import { SupabaseClient } from "@supabase/supabase-js"

export async function getDashboardDateRange(supabase: SupabaseClient, userId: string) {
  return supabase
    .from("profiles")
    .select("start_date, end_date")
    .eq("user_id", userId)
    .single()
}
