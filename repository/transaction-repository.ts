import { SupabaseClient } from "@supabase/supabase-js"

export type Transaction = {
  id?: string | number
  name: string
  date: string
  amount: number
  type: "Income" | "Expense" | "Transfer"
  budget_id?: string | null
  wallet_id?: string | null
  transfer_id?: string | null
  user_id: string
  admin_fee?: number | null
}

export async function findTransactionsByUserId(supabase: SupabaseClient, userId: string) {
  return supabase
    .from("transactions")
    .select("id, name, date, amount, type, budget_id, wallet_id, transfer_id, admin_fee")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
}

export async function findTransactions(supabase: SupabaseClient, filters: { userId: string, type?: "Income" | "Expense" | "Transfer", startDate?: string, endDate?: string }) {
  let query = supabase
    .from("transactions")
    .select("id, name, date, amount, type, budget_id, wallet_id, transfer_id, admin_fee")
    .eq("user_id", filters.userId)

  if (filters.type) {
    query = query.eq("type", filters.type)
  }
  if (filters.startDate) {
    query = query.gte("date", filters.startDate)
  }
  if (filters.endDate) {
    query = query.lte("date", filters.endDate)
  }

  return query.order("date", { ascending: false })
}

export async function findTransactionById(supabase: SupabaseClient, id: string | number) {
  return supabase
    .from("transactions")
    .select("id, name, date, amount, type, budget_id, wallet_id, transfer_id, admin_fee")
    .eq("id", id)
    .single()
}

export async function insertTransaction(supabase: SupabaseClient, transaction: Omit<Transaction, "id">) {
  return supabase
    .from("transactions")
    .insert(transaction)
}

export async function updateTransactionById(supabase: SupabaseClient, id: string | number, transaction: Partial<Omit<Transaction, "id" | "user_id">>) {
  return supabase
    .from("transactions")
    .update(transaction)
    .eq("id", id)
}

export async function deleteTransactionById(supabase: SupabaseClient, id: string | number) {
  return supabase
    .from("transactions")
    .delete()
    .eq("id", id)
}

export async function clearBudgetIdFromTransactions(supabase: SupabaseClient, budgetId: string) {
  return supabase
    .from("transactions")
    .update({ budget_id: null })
    .eq("budget_id", budgetId)
}
