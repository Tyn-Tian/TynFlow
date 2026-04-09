"use server"

import { createClient } from "@/lib/supabase/server"
import * as budgetService from "@/services/budget-service"

export async function getBudgetsAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  return budgetService.getBudgets(supabase, user.id)
}
