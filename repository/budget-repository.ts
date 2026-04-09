import { SupabaseClient } from "@supabase/supabase-js"

export type Budget = {
  id: string
  name: string
  leftover: number
  user_id?: string
}

export async function getBudgetsByUserId(supabase: SupabaseClient, userId: string) {
  return supabase
    .from("budgets")
    .select("id, name, leftover")
    .eq("user_id", userId)
    .order("name", { ascending: true })
}

export async function getBudgetById(supabase: SupabaseClient, id: string) {
  return supabase
    .from("budgets")
    .select("id, name, leftover")
    .eq("id", id)
    .single()
}

export async function updateBudgetLeftover(supabase: SupabaseClient, id: string, leftover: number) {
  return supabase
    .from("budgets")
    .update({ leftover })
    .eq("id", id)
}
