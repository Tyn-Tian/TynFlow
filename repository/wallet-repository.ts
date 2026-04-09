import { SupabaseClient } from "@supabase/supabase-js"

export type Wallet = {
  id?: string
  name: string
  type: string
  balance: number
  user_id?: string
}

export async function getWalletsByUserId(supabase: SupabaseClient, userId: string) {
  return supabase
    .from("wallets")
    .select("id, name, type, balance")
    .eq("user_id", userId)
    .order("name", { ascending: true })
}

export async function getWalletById(supabase: SupabaseClient, id: string) {
  return supabase
    .from("wallets")
    .select("id, name, type, balance")
    .eq("id", id)
    .single()
}

export async function createWallet(supabase: SupabaseClient, wallet: Wallet) {
  return supabase.from("wallets").insert(wallet)
}

export async function updateWallet(supabase: SupabaseClient, id: string, wallet: Partial<Omit<Wallet, "id">>) {
  return supabase.from("wallets").update(wallet).eq("id", id)
}

export async function deleteWallet(supabase: SupabaseClient, id: string) {
  return supabase.from("wallets").delete().eq("id", id)
}
