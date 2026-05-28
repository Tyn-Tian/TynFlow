"use client"

import { TransactionFiltersSkeleton } from "@/components/transactions/skeleton/transaction-filters-skeleton"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import useWallet from "@/hooks/use-wallet"
import useBudget from "@/hooks/use-budget"

export function TransactionFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const walletId = searchParams.get("walletId") || ""
  const budgetId = searchParams.get("budgetId") || ""

  const { data: wallets, isLoading: isWalletsLoading } = useWallet();
  const { data: budgets, isLoading: isBudgetsLoading } = useBudget();
  
  const isLoading = isWalletsLoading || isBudgetsLoading;
  
  if (isLoading) return <TransactionFiltersSkeleton />;

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
    <div className="flex items-end gap-2 my-4">
      <Select value={walletId || "all"} onValueChange={(v) => updateFilter("walletId", v)}>
        <SelectTrigger id="wallet-filter" className="w-full sm:w-fit">
          <SelectValue placeholder="All Wallets" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Wallets</SelectItem>
          {wallets?.map((w) => (
            <SelectItem key={w.id} value={w.id}>
              {w.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={budgetId || "all"} onValueChange={(v) => updateFilter("budgetId", v)}>
        <SelectTrigger id="budget-filter" className="w-full sm:w-fit">
          <SelectValue placeholder="All Budgets" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Budgets</SelectItem>
          {budgets?.map((b) => (
            <SelectItem key={b.id} value={b.id}>
              {b.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
