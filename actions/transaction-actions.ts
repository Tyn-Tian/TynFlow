"use server"

import { createClient } from "@/lib/supabase/server"
import * as transactionService from "@/services/transaction-service"
import { Transaction } from "@/repository/transaction-repository"
import { revalidatePath } from "next/cache"

export async function getTransactionsAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  return transactionService.getTransactions(supabase, user.id)
}

export async function getTransactionAction(id: string | number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  return transactionService.getTransaction(supabase, id)
}

export async function addTransactionAction(input: Omit<Transaction, "user_id">) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  await transactionService.addTransaction(supabase, { ...input, user_id: user.id })
  revalidatePath("/transactions")
  revalidatePath("/")
  revalidatePath("/wallet")
}

export async function editTransactionAction(id: string | number, input: Omit<Transaction, "user_id">) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  await transactionService.editTransaction(supabase, id, { ...input, user_id: user.id })
  revalidatePath("/transactions")
  revalidatePath("/")
  revalidatePath("/wallet")
}

export async function removeTransactionAction(id: string | number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  await transactionService.removeTransaction(supabase, id)
  revalidatePath("/transactions")
  revalidatePath("/")
  revalidatePath("/wallet")
}
