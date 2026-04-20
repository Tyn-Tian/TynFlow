import { SupabaseClient } from "@supabase/supabase-js"

export type Job = {
  id: number
  position: string
  company: string
  source: string
  status: string
  applied_at: string
  updated_at: string
}

export async function findJobsByUserId(
  supabase: SupabaseClient,
  userId: string,
  params: { from: number; to: number }
) {
  return supabase
    .from("jobs")
    .select("id, position, company, source, status, applied_at, updated_at", { count: "exact" })
    .eq("user_id", userId)
    .range(params.from, params.to)
    .order("updated_at", { ascending: false })
}

export async function findAllJobsByUserId(supabase: SupabaseClient, userId: string) {
  return supabase
    .from("jobs")
    .select("id, position, company, source, status, applied_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
}
