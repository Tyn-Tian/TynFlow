import { SupabaseClient } from "@supabase/supabase-js"
import * as transactionRepository from "@/repository/transaction-repository"
import * as walletService from "@/services/wallet-service"
import * as budgetService from "@/services/budget-service"
import * as portfolioService from "@/services/portfolio-service"

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

  const portfolioIds = Array.from(new Set(rows.map((r) => r.portfolio_id).filter(Boolean) as string[]))
  let portfolioMap: Record<string, string> = {}
  if (portfolioIds.length) {
    const { data: portfoliosData, error: portfoliosError } = await supabase
      .from("portfolios")
      .select("id, name")
      .in("id", portfolioIds)
    if (!portfoliosError && portfoliosData) portfolioMap = Object.fromEntries((portfoliosData as { id: string; name?: string }[]).map((p) => [p.id, p.name ?? ""]))
  }

  return rows.map((t) => ({
    ...t,
    budgetName: t.budget_id ? budgetMap[t.budget_id] : undefined,
    walletName: t.wallet_id ? walletMap[t.wallet_id] : undefined,
    transferName: t.transfer_id ? walletMap[t.transfer_id] : undefined,
    portfolioName: t.portfolio_id ? portfolioMap[t.portfolio_id] : undefined,
  }))
}

export async function getFilteredTransactions(supabase: SupabaseClient, filters: { userId: string, type?: "Income" | "Expense" | "Transfer" | "Invest", startDate?: string, endDate?: string, walletId?: string, budgetId?: string, dates?: string[] }) {
  const { data, error } = await transactionRepository.findTransactions(supabase, filters)
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getPaginatedTransactions(
  supabase: SupabaseClient, 
  params: { userId: string, page: number, walletId?: string, budgetId?: string }
) {
  const { page, userId, walletId, budgetId } = params

  // 1. Get all dates matching filters
  const { data: dateRows, error: dateError } = await transactionRepository.findTransactionDates(supabase, { userId, walletId, budgetId })
  if (dateError) throw new Error(dateError.message)

  // 2. Get unique dates in descending order (transactionRepository already orders them, but Set removes duplicates)
  // ensure we have unique dates
  const allUniqueDates = Array.from(new Set((dateRows ?? []).map(r => r.date)))

  // 3. Slice dates for the current page (10 unique dates per page)
  const pageDates = allUniqueDates.slice((page - 1) * 10, page * 10)

  if (pageDates.length === 0) return []

  const rows = await getFilteredTransactions(supabase, {
    userId,
    walletId,
    budgetId,
    dates: pageDates
  })

  // Enrich data with wallet and budget names
  const walletIds = Array.from(new Set(rows.flatMap((r) => [r.wallet_id, r.transfer_id].filter(Boolean) as string[])))
  let walletMap: Record<string, string> = {}
  if (walletIds.length) {
    const { data: walletsData } = await supabase.from("wallets").select("id, name").in("id", walletIds)
    if (walletsData) walletMap = Object.fromEntries(walletsData.map((w) => [w.id, w.name ?? ""]))
  }

  const budgetIds = Array.from(new Set(rows.map((r) => r.budget_id).filter(Boolean) as string[]))
  let budgetMap: Record<string, string> = {}
  if (budgetIds.length) {
    const { data: budgetsData } = await supabase.from("budgets").select("id, name").in("id", budgetIds)
    if (budgetsData) budgetMap = Object.fromEntries(budgetsData.map((b) => [b.id, b.name ?? ""]))
  }

  const portfolioIds = Array.from(new Set(rows.map((r) => r.portfolio_id).filter(Boolean) as string[]))
  let portfolioMap: Record<string, string> = {}
  if (portfolioIds.length) {
    const { data: portfoliosData } = await supabase.from("portfolios").select("id, name").in("id", portfolioIds)
    if (portfoliosData) portfolioMap = Object.fromEntries(portfoliosData.map((p) => [p.id, p.name ?? ""]))
  }

  return rows.map((t) => ({
    ...t,
    budgetName: t.budget_id ? budgetMap[t.budget_id] : undefined,
    walletName: t.wallet_id ? walletMap[t.wallet_id] : undefined,
    transferName: t.transfer_id ? walletMap[t.transfer_id] : undefined,
    portfolioName: t.portfolio_id ? portfolioMap[t.portfolio_id] : undefined,
  }))
}

export async function getTransactionPaginationMetadata(supabase: SupabaseClient, params: { userId: string, walletId?: string, budgetId?: string }) {
  const { data: dateRows, error: dateError } = await transactionRepository.findTransactionDates(supabase, params)
  if (dateError || !dateRows) return { totalPages: 1 }

  const allUniqueDates = Array.from(new Set(dateRows.map(r => r.date)))
  const totalPages = Math.ceil(allUniqueDates.length / 10)

  return { totalPages: Math.max(1, totalPages) }
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
  } else if (input.type === "Invest") {
    if (!input.wallet_id || !input.portfolio_id) throw new Error("Wallet and Portfolio are required for investment.")
    await walletService.updateBalance(supabase, input.wallet_id, -(input.amount + (input.admin_fee ?? 0)))
    await portfolioService.updateInvestmentValue(supabase, input.portfolio_id, input.amount)
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
  } else if (oldTx.type === "Invest") {
    if (oldTx.wallet_id) await walletService.updateBalance(supabase, oldTx.wallet_id, oldTx.amount + (oldTx.admin_fee ?? 0))
    if (oldTx.portfolio_id) await portfolioService.updateInvestmentValue(supabase, oldTx.portfolio_id, -oldTx.amount)
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
  } else if (input.type === "Invest") {
    if (input.wallet_id) await walletService.updateBalance(supabase, input.wallet_id, -(input.amount + (input.admin_fee ?? 0)))
    if (input.portfolio_id) await portfolioService.updateInvestmentValue(supabase, input.portfolio_id, input.amount)
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
  } else if (tx.type === "Invest") {
    if (tx.wallet_id) await walletService.updateBalance(supabase, tx.wallet_id, tx.amount + (tx.admin_fee ?? 0))
    if (tx.portfolio_id) await portfolioService.updateInvestmentValue(supabase, tx.portfolio_id, -tx.amount)
  } else {
    if (tx.wallet_id) {
      const delta = tx.type === "Income" ? -tx.amount : tx.amount
      await walletService.updateBalance(supabase, tx.wallet_id, delta)
    }
  }

  const { error: deleteError } = await transactionRepository.deleteTransactionById(supabase, id)
  if (deleteError) throw new Error(deleteError.message)
}
