import { SupabaseClient } from "@supabase/supabase-js"
import * as budgetRepository from "@/repository/budget-repository"

export async function getBudgets(supabase: SupabaseClient, userId: string) {
  const { data, error } = await budgetRepository.getBudgetsByUserId(supabase, userId)
  if (error) throw new Error(error.message)
  return data
}

export async function updateLeftover(supabase: SupabaseClient, id: string, delta: number) {
  const { data: bData, error: bErr } = await budgetRepository.getBudgetById(supabase, id)
  if (bErr) throw new Error(bErr.message)

  const currentLeftover = bData?.leftover ?? 0
  const newLeftover = Math.max(0, currentLeftover + delta)
  const { error } = await budgetRepository.updateBudgetLeftover(supabase, id, newLeftover)
  if (error) throw new Error(error.message)
}
