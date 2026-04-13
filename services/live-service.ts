import { SupabaseClient } from "@supabase/supabase-js"
import * as liveRepository from "@/repository/live-repository"
import { normalizeLiveItems } from "@/components/live/live-data"

export async function getLives(supabase: SupabaseClient, userId: string) {
  const { data, error } = await liveRepository.findLivesByUserId(supabase, userId)
  if (error) throw new Error(error.message)
  
  return normalizeLiveItems(data ?? [])
}

export async function getLive(supabase: SupabaseClient, id: string | number) {
  const { data, error } = await liveRepository.findLiveById(supabase, id)
  if (error) throw new Error(error.message)
  return data
}

export async function addLive(supabase: SupabaseClient, input: liveRepository.Live) {
  const { error } = await liveRepository.insertLive(supabase, input)
  if (error) throw new Error(error.message)
}

export async function editLive(supabase: SupabaseClient, id: string | number, input: Omit<liveRepository.Live, "id" | "user_id">) {
  const { error } = await liveRepository.updateLiveById(supabase, id, input)
  if (error) throw new Error(error.message)
}

export async function removeLive(supabase: SupabaseClient, id: string | number) {
  const { error } = await liveRepository.deleteLiveById(supabase, id)
  if (error) throw new Error(error.message)
}

export function toIsoDate(dateStr: string) {
  const [dd, mm, yyyy] = dateStr.split("/")
  const day = Number(dd)
  const month = Number(mm)
  const year = Number(yyyy)
  const parsed = new Date(year, month - 1, day)

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    throw new Error("Invalid date")
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}
