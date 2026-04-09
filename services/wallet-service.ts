import { SupabaseClient } from "@supabase/supabase-js"
import * as walletRepository from "@/repository/wallet-repository"

export type CreateWalletInput = {
  name: string
  type: string
  balance: number
  user_id: string
}

export type UpdateWalletInput = {
  name?: string
  type?: string
  balance?: number
}

export async function getWallets(supabase: SupabaseClient, userId: string) {
  const { data, error } = await walletRepository.getWalletsByUserId(supabase, userId)
  if (error) throw new Error(error.message)
  return data
}

export async function addWallet(supabase: SupabaseClient, input: CreateWalletInput) {
  const { error } = await walletRepository.createWallet(supabase, input)
  if (error) throw new Error(error.message)
}

export async function editWallet(supabase: SupabaseClient, id: string, input: UpdateWalletInput) {
  const { error } = await walletRepository.updateWallet(supabase, id, input)
  if (error) throw new Error(error.message)
}

export async function removeWallet(supabase: SupabaseClient, id: string) {
  const { error } = await walletRepository.deleteWallet(supabase, id)
  if (error) throw new Error(error.message)
}
