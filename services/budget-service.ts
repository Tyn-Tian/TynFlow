import { SupabaseClient } from "@supabase/supabase-js"
import * as budgetRepository from "@/repository/budget-repository"
import * as transactionRepository from "@/repository/transaction-repository"

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

export async function addBudget(supabase: SupabaseClient, input: { name: string; total: number; user_id: string }) {
  const { error } = await budgetRepository.createBudget(supabase, {
    name: input.name,
    total: input.total,
    leftover: input.total,
    user_id: input.user_id,
  })
  if (error) throw new Error(error.message)
}

export async function editBudget(supabase: SupabaseClient, id: string, input: { name: string; total: number; leftover: number }) {
  const { error } = await budgetRepository.updateBudget(supabase, id, {
    name: input.name,
    total: input.total,
    leftover: input.leftover,
  })
  if (error) throw new Error(error.message)
}

export async function removeBudget(supabase: SupabaseClient, id: string) {
  // First clear the budget_id from all transactions using it
  const { error: clearErr } = await transactionRepository.clearBudgetIdFromTransactions(supabase, id)
  if (clearErr) throw new Error(clearErr.message)

  const { error } = await budgetRepository.deleteBudget(supabase, id)
  if (error) throw new Error(error.message)
}
