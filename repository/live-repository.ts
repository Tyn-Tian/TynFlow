import { SupabaseClient } from "@supabase/supabase-js"

export type Live = {
  id?: string | number
  date: string
  type: "Lembur" | "Biasa"
  tiktok: number
  shopee: number
  user_id: string
}

export async function findLivesByUserId(supabase: SupabaseClient, userId: string) {
  return supabase
    .from("lives")
    .select("id, date, type, tiktok, shopee")
    .eq("user_id", userId)
    .order("date", { ascending: false })
}

export async function findLiveById(supabase: SupabaseClient, id: string | number) {
  return supabase
    .from("lives")
    .select("id, date, type, tiktok, shopee, user_id")
    .eq("id", id)
    .single()
}

export async function insertLive(supabase: SupabaseClient, live: Omit<Live, "id">) {
  return supabase
    .from("lives")
    .insert(live)
}

export async function updateLiveById(supabase: SupabaseClient, id: string | number, live: Partial<Omit<Live, "id" | "user_id">>) {
  return supabase
    .from("lives")
    .update(live)
    .eq("id", id)
}

export async function deleteLiveById(supabase: SupabaseClient, id: string | number) {
  return supabase
    .from("lives")
    .delete()
    .eq("id", id)
}
