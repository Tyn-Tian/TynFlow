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

  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id

  let startDate: string | undefined
  let endDate: string | undefined
  if (userId) {
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("start_date, end_date")
      .eq("user_id", userId)
      .single()

    if (!profileErr && profile) {
      startDate = profile.start_date as unknown as string | undefined
      endDate = profile.end_date as unknown as string | undefined
    }
  }

  const incomeQuery = supabase.from("transactions").select("amount").eq("type", "Income")
  const expenseQuery = supabase.from("transactions").select("amount").eq("type", "Expense")
  if (userId) {
    incomeQuery.eq("user_id", userId)
    expenseQuery.eq("user_id", userId)
  }
  if (startDate) {
    incomeQuery.gte("date", startDate)
    expenseQuery.gte("date", startDate)
  }
  if (endDate) {
    incomeQuery.lte("date", endDate)
    expenseQuery.lte("date", endDate)
  }

  // fetch current and (optionally) previous-period totals and compute changes
  const sumAmounts = (rows: Array<{ amount?: number | string }> | null | undefined) =>
    (rows ?? []).reduce((sum: number, row) => {
      const amt = typeof row.amount === "number" ? row.amount : Number(row.amount || 0)
      return sum + (Number.isNaN(amt) ? 0 : amt)
    }, 0)

  let incomeTotal = 0
  let expenseTotal = 0
  let incomePrevTotal = 0
  let expensePrevTotal = 0

  if (startDate && endDate) {
    // compute previous period by subtracting one month
    const sd = new Date(startDate)
    const ed = new Date(endDate)
    const prevSd = new Date(sd)
    const prevEd = new Date(ed)
    prevSd.setMonth(prevSd.getMonth() - 1)
    prevEd.setMonth(prevEd.getMonth() - 1)
    const prevStartIso = prevSd.toISOString()
    const prevEndIso = prevEd.toISOString()

    const incomePrevQ = supabase.from("transactions").select("amount").eq("type", "Income")
    const expensePrevQ = supabase.from("transactions").select("amount").eq("type", "Expense")
    if (userId) {
      incomePrevQ.eq("user_id", userId)
      expensePrevQ.eq("user_id", userId)
    }
    incomePrevQ.gte("date", prevStartIso).lte("date", prevEndIso)
    expensePrevQ.gte("date", prevStartIso).lte("date", prevEndIso)

    const [incomeRes, expenseRes, incomePrevRes, expensePrevRes] = await Promise.all([
      incomeQuery,
      expenseQuery,
      incomePrevQ,
      expensePrevQ,
    ])

    if (incomeRes.error) console.error("Failed to fetch income transactions:", incomeRes.error)
    if (expenseRes.error) console.error("Failed to fetch expense transactions:", expenseRes.error)

    incomeTotal = sumAmounts(incomeRes.data as { amount?: number | string }[] | null | undefined)
    expenseTotal = sumAmounts(expenseRes.data as { amount?: number | string }[] | null | undefined)
    incomePrevTotal = sumAmounts(incomePrevRes.data as { amount?: number | string }[] | null | undefined)
    expensePrevTotal = sumAmounts(expensePrevRes.data as { amount?: number | string }[] | null | undefined)
  } else {
    const [incomeRes, expenseRes] = await Promise.all([incomeQuery, expenseQuery])
    if (incomeRes.error) console.error("Failed to fetch income transactions:", incomeRes.error)
    if (expenseRes.error) console.error("Failed to fetch expense transactions:", expenseRes.error)

    incomeTotal = sumAmounts(incomeRes.data as { amount?: number | string }[] | null | undefined)
    expenseTotal = sumAmounts(expenseRes.data as { amount?: number | string }[] | null | undefined)
    incomePrevTotal = 0
    expensePrevTotal = 0
  }

  const calcChange = (current: number, previous: number) => {
    if (previous === 0) return current === 0 ? 0 : 100
    return ((current - previous) / Math.abs(previous)) * 100
  }

  const incomeChange = calcChange(incomeTotal, incomePrevTotal)
  const expenseChange = calcChange(expenseTotal, expensePrevTotal)

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
              {incomeChange > 0 ? <IconTrendingUp /> : incomeChange < 0 ? <IconTrendingDown /> : <IconTrendingUp />}
              {incomeChange > 0 ?
                `+${Math.round(incomeChange)}%` : incomeChange < 0 ? `${Math.round(incomeChange)}%` : `0%`}
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
              {expenseChange > 0 ? <IconTrendingUp /> : expenseChange < 0 ? <IconTrendingDown /> : <IconTrendingUp />}
              {expenseChange > 0 ? `+${Math.round(expenseChange)}%` : expenseChange < 0 ? `${Math.round(expenseChange)}%` : `0%`}
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
