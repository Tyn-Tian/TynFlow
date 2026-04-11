"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Option = {
  id: string
  name: string
}

interface TransactionFiltersProps {
  wallets: Option[]
  budgets: Option[]
}

export function TransactionFilters({ wallets, budgets }: TransactionFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const walletId = searchParams.get("walletId") || ""
  const budgetId = searchParams.get("budgetId") || ""

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set("page", "1")
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-end gap-2 mb-4">
      <div className="space-y-1.5">
        <Select value={walletId || "all"} onValueChange={(v) => updateFilter("walletId", v)}>
          <SelectTrigger id="wallet-filter">
            <SelectValue placeholder="All Wallets" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Wallets</SelectItem>
            {wallets.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Select value={budgetId || "all"} onValueChange={(v) => updateFilter("budgetId", v)}>
          <SelectTrigger id="budget-filter">
            <SelectValue placeholder="All Budgets" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Budgets</SelectItem>
            {budgets.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
