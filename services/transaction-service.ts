import { SupabaseClient } from "@supabase/supabase-js"
import * as transactionRepository from "@/repository/transaction-repository"
import * as walletService from "@/services/wallet-service"
import * as budgetService from "@/services/budget-service"

export async function getTransactions(supabase: SupabaseClient, userId: string) {
  const { data: txData, error: txError } = await transactionRepository.findTransactionsByUserId(supabase, userId)
  if (txError) throw new Error(txError.message)

  const rows = txData ?? []

  const walletIds = Array.from(new Set(rows.flatMap((r) => [r.wallet_id, r.transfer_id].filter(Boolean) as string[])))
  let walletMap: Record<string, string> = {}
  if (walletIds.length) {
    const { data: walletsData, error: walletsError } = await supabase
      .from("wallets")
      .select("id, name")
      .in("id", walletIds)
    if (!walletsError && walletsData) walletMap = Object.fromEntries((walletsData as { id: string; name?: string }[]).map((w) => [w.id, w.name ?? ""]))
  }

  const budgetIds = Array.from(new Set(rows.map((r) => r.budget_id).filter(Boolean) as string[]))
  let budgetMap: Record<string, string> = {}
  if (budgetIds.length) {
    const { data: budgetsData, error: budgetsError } = await supabase
      .from("budgets")
      .select("id, name")
      .in("id", budgetIds)
    if (!budgetsError && budgetsData) budgetMap = Object.fromEntries((budgetsData as { id: string; name?: string }[]).map((b) => [b.id, b.name ?? ""]))
  }

  return rows.map((t) => ({
    ...t,
    budgetName: t.budget_id ? budgetMap[t.budget_id] : undefined,
    walletName: t.wallet_id ? walletMap[t.wallet_id] : undefined,
    transferName: t.transfer_id ? walletMap[t.transfer_id] : undefined,
  }))
}

export async function getFilteredTransactions(supabase: SupabaseClient, filters: { userId: string, type?: "Income" | "Expense" | "Transfer", startDate?: string, endDate?: string }) {
  const { data, error } = await transactionRepository.findTransactions(supabase, filters)
  if (error) throw new Error(error.message)
  return data ?? []
}


export async function getTransaction(supabase: SupabaseClient, id: string | number) {
  const { data, error } = await transactionRepository.findTransactionById(supabase, id)
  if (error) throw new Error(error.message)
  return data
}

export async function addTransaction(supabase: SupabaseClient, input: transactionRepository.Transaction) {
  const { error: insertError } = await transactionRepository.insertTransaction(supabase, input)
  if (insertError) throw new Error(insertError.message)

  if (input.type === "Expense" && input.budget_id) {
    await budgetService.updateLeftover(supabase, input.budget_id, -input.amount)
  }

  if (input.type === "Transfer") {
    if (!input.wallet_id || !input.transfer_id) throw new Error("Source and destination wallets are required for transfer.")
    await walletService.updateBalance(supabase, input.wallet_id, -(input.amount + (input.admin_fee ?? 0)))
    await walletService.updateBalance(supabase, input.transfer_id, input.amount)
  } else {
    if (input.wallet_id) {
      const delta = input.type === "Income" ? input.amount : -input.amount
      await walletService.updateBalance(supabase, input.wallet_id, delta)
    }
  }
}

export async function editTransaction(supabase: SupabaseClient, id: string | number, input: transactionRepository.Transaction) {
  const { data: oldTx, error: fetchError } = await transactionRepository.findTransactionById(supabase, id)
  if (fetchError) throw new Error(fetchError.message)

  if (oldTx.type === "Expense" && oldTx.budget_id) {
    await budgetService.updateLeftover(supabase, oldTx.budget_id, oldTx.amount)
  }
  
  if (oldTx.type === "Transfer") {
    if (oldTx.wallet_id) await walletService.updateBalance(supabase, oldTx.wallet_id, oldTx.amount + (oldTx.admin_fee ?? 0))
    if (oldTx.transfer_id) await walletService.updateBalance(supabase, oldTx.transfer_id, -oldTx.amount)
  } else {
    if (oldTx.wallet_id) {
      const delta = oldTx.type === "Income" ? -oldTx.amount : oldTx.amount
      await walletService.updateBalance(supabase, oldTx.wallet_id, delta)
    }
  }

  const { error: updateError } = await transactionRepository.updateTransactionById(supabase, id, input)
  if (updateError) throw new Error(updateError.message)

  if (input.type === "Expense" && input.budget_id) {
    await budgetService.updateLeftover(supabase, input.budget_id, -input.amount)
  }

  if (input.type === "Transfer") {
    if (input.wallet_id) await walletService.updateBalance(supabase, input.wallet_id, -(input.amount + (input.admin_fee ?? 0)))
    if (input.transfer_id) await walletService.updateBalance(supabase, input.transfer_id, input.amount)
  } else {
    if (input.wallet_id) {
      const delta = input.type === "Income" ? input.amount : -input.amount
      await walletService.updateBalance(supabase, input.wallet_id, delta)
    }
  }
}

export async function removeTransaction(supabase: SupabaseClient, id: string | number) {
  const { data: tx, error: fetchError } = await transactionRepository.findTransactionById(supabase, id)
  if (fetchError) throw new Error(fetchError.message)

  if (tx.type === "Expense" && tx.budget_id) {
    await budgetService.updateLeftover(supabase, tx.budget_id, tx.amount)
  }

  if (tx.type === "Transfer") {
    if (tx.wallet_id) await walletService.updateBalance(supabase, tx.wallet_id, tx.amount + (tx.admin_fee ?? 0))
    if (tx.transfer_id) await walletService.updateBalance(supabase, tx.transfer_id, -tx.amount)
  } else {
    if (tx.wallet_id) {
      const delta = tx.type === "Income" ? -tx.amount : tx.amount
      await walletService.updateBalance(supabase, tx.wallet_id, delta)
    }
  }

  const { error: deleteError } = await transactionRepository.deleteTransactionById(supabase, id)
  if (deleteError) throw new Error(deleteError.message)
}
