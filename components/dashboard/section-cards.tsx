import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatRupiah } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"
export async function SectionCards() {
  const supabase = await createClient()

  const [incomeRes, expenseRes] = await Promise.all([
    supabase.from("transactions").select("amount").eq("type", "Income"),
    supabase.from("transactions").select("amount").eq("type", "Expense"),
  ])

  if (incomeRes.error)
    console.error("Failed to fetch income transactions:", incomeRes.error)
  if (expenseRes.error)
    console.error("Failed to fetch expense transactions:", expenseRes.error)

  const incomeTotal = (incomeRes.data ?? []).reduce(
    (sum: number, row: { amount?: number | string }) => {
      const amt = typeof row.amount === "number" ? row.amount : Number(row.amount || 0)
      return sum + (Number.isNaN(amt) ? 0 : amt)
    },
    0,
  )

  const expenseTotal = (expenseRes.data ?? []).reduce(
    (sum: number, row: { amount?: number | string }) => {
      const amt = typeof row.amount === "number" ? row.amount : Number(row.amount || 0)
      return sum + (Number.isNaN(amt) ? 0 : amt)
    },
    0,
  )

  const formattedIncome = formatRupiah(incomeTotal)
  const formattedExpense = formatRupiah(expenseTotal)
  const cashFlow = incomeTotal - expenseTotal
  const formattedCashFlow = formatRupiah(cashFlow)
  const cashFlowFooter =
    cashFlow > 0
      ? "Cash flow improving — healthy"
      : cashFlow < 0
      ? "Cash flow deficit — review expenses"
      : "Cash flow stable"

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 px-6">
      <Card className="@container/card gap-2">
        <CardHeader>
          <CardDescription>Total Income</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formattedIncome}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              0%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Visitors for the last 6 months
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card gap-2">
        <CardHeader>
          <CardDescription>Total Expense</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formattedExpense}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              0%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Acquisition needs attention
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card gap-2">
        <CardHeader>
          <CardDescription>Cash Flow</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formattedCashFlow}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {cashFlow >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {cashFlow > 0 ? "+" : cashFlow < 0 ? "-" : "0"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">{cashFlowFooter}</div>
        </CardFooter>
      </Card>
    </div>
  )
}
