"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import * as budgetService from "@/services/budget-service"

export async function getBudgetsAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  return budgetService.getBudgets(supabase, user.id)
}

export async function addBudgetAction(input: { name: string; total: number }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  await budgetService.addBudget(supabase, { ...input, user_id: user.id })
  revalidatePath("/budget")
}

export async function editBudgetAction(id: string, input: { name: string; total: number; leftover: number }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  await budgetService.editBudget(supabase, id, input)
  revalidatePath("/budget")
  revalidatePath("/transactions")
}

export async function removeBudgetAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  await budgetService.removeBudget(supabase, id)
  revalidatePath("/budget")
  revalidatePath("/transactions")
}
