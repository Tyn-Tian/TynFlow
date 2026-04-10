"use server"

import { createClient } from "@/lib/supabase/server"
import * as portfolioService from "@/services/portfolio-service"
import { revalidatePath } from "next/cache"

export async function getPortfoliosAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  return portfolioService.getPortfolios(supabase, user.id)
}

export async function addPortfolioAction(input: Omit<portfolioService.CreatePortfolioInput, "user_id">) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  await portfolioService.addPortfolio(supabase, { ...input, user_id: user.id })
  revalidatePath("/portfolio")
}

export async function editPortfolioAction(id: string | number, input: portfolioService.UpdatePortfolioInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  await portfolioService.editPortfolio(supabase, id, input)
  revalidatePath("/portfolio")
}

export async function removePortfolioAction(id: string | number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  await portfolioService.removePortfolio(supabase, id)
  revalidatePath("/portfolio")
}
