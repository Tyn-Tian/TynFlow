import { SupabaseClient } from "@supabase/supabase-js"
import * as portfolioRepository from "@/repository/portfolio-repository"

export type CreatePortfolioInput = {
  name: string
  type: portfolioRepository.PortfolioType
  target: number
  invested: number
  current_value: number
  user_id: string
}

export type UpdatePortfolioInput = {
  name?: string
  type?: portfolioRepository.PortfolioType
  target?: number
  invested?: number
  current_value?: number
}

// Re-export type for convenience if needed
export type PortfolioItem = {
    id: string
    name: string
    type: portfolioRepository.PortfolioType
    target: number
    invested: number
    currentValue: number
}

export function getPortfolioType(value: string | null | undefined): portfolioRepository.PortfolioType {
    if (value === "Saham" || value === "Crypto" || value === "Emas") {
        return value
    }
    return "Reksadana"
}

function getPortfolioNumber(value: number | string | null | undefined) {
    const amount = Number(value)
    return Number.isFinite(amount) ? amount : 0
}

function getPortfolioText(value: string | null | undefined) {
    return value?.trim() ?? ""
}

export function normalizePortfolioItems(
    items: Array<{
        id: string | number | null
        name: string | null
        type: string | null
        target: number | string | null
        invested: number | string | null
        current_value: number | string | null
    }>
): PortfolioItem[] {
    return items.map((item, index) => ({
        id: String(item.id ?? `portfolio-${index}`),
        name: getPortfolioText(item.name),
        type: getPortfolioType(item.type),
        target: getPortfolioNumber(item.target),
        invested: getPortfolioNumber(item.invested),
        currentValue: getPortfolioNumber(item.current_value),
    }))
}

export async function getPortfolios(supabase: SupabaseClient, userId: string) {
  const { data, error } = await portfolioRepository.findPortfoliosByUserId(supabase, userId)
  if (error) throw new Error(error.message)
  return normalizePortfolioItems(data ?? [])
}

export async function addPortfolio(supabase: SupabaseClient, input: CreatePortfolioInput) {
  const { error } = await portfolioRepository.insertPortfolio(supabase, input)
  if (error) throw new Error(error.message)
}

export async function editPortfolio(supabase: SupabaseClient, id: string | number, input: UpdatePortfolioInput) {
  const { error } = await portfolioRepository.updatePortfolioById(supabase, id, input)
  if (error) throw new Error(error.message)
}

export async function removePortfolio(supabase: SupabaseClient, id: string | number) {
  const { error } = await portfolioRepository.deletePortfolioById(supabase, id)
  if (error) throw new Error(error.message)
}
