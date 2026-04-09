"use server"

import { createClient } from "@/lib/supabase/server"
import * as walletService from "@/services/wallet-service"
import { revalidatePath } from "next/cache"

export async function getWalletsAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  return walletService.getWallets(supabase, user.id)
}

export async function addWalletAction(input: Omit<walletService.CreateWalletInput, "user_id">) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  await walletService.addWallet(supabase, { ...input, user_id: user.id })
  revalidatePath("/wallet")
}

export async function editWalletAction(id: string, input: walletService.UpdateWalletInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  await walletService.editWallet(supabase, id, input)
  revalidatePath("/wallet")
}

export async function removeWalletAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  await walletService.removeWallet(supabase, id)
  revalidatePath("/wallet")
}
