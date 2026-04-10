import { SupabaseClient } from "@supabase/supabase-js"

export type PortfolioType = "Reksadana" | "Saham" | "Crypto" | "Emas"

export type Portfolio = {
  id?: string
  name: string
  type: PortfolioType
  target: number
  invested: number
  current_value: number
  user_id?: string
}

export async function findPortfoliosByUserId(supabase: SupabaseClient, userId: string) {
  return supabase
    .from("portfolios")
    .select("id, name, type, target, invested, current_value")
    .eq("user_id", userId)
    .order("name", { ascending: true })
}

export async function findPortfolioById(supabase: SupabaseClient, id: string | number) {
  return supabase
    .from("portfolios")
    .select("id, name, type, target, invested, current_value, user_id")
    .eq("id", id)
    .single()
}

export async function insertPortfolio(supabase: SupabaseClient, portfolio: Portfolio) {
  return supabase.from("portfolios").insert(portfolio)
}

export async function updatePortfolioById(
  supabase: SupabaseClient,
  id: string | number,
  portfolio: Partial<Omit<Portfolio, "id">>
) {
  return supabase.from("portfolios").update(portfolio).eq("id", id)
}

export async function deletePortfolioById(supabase: SupabaseClient, id: string | number) {
  return supabase.from("portfolios").delete().eq("id", id)
}
