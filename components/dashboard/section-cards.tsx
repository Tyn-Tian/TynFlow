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
import { getSummaryCardsAction } from "@/actions/dashboard-actions"

export async function SectionCards() {
  const data = await getSummaryCardsAction()

  const incomeChange = data.incomeChange
  const expenseChange = data.expenseChange

  const formattedIncome = formatRupiah(data.incomeTotal)
  const formattedExpense = formatRupiah(data.expenseTotal)
  const cashFlow = data.cashFlow
  const formattedCashFlow = formatRupiah(cashFlow)
  const cashFlowFooter =
    cashFlow > 0
      ? "Cash flow improving — healthy"
      : cashFlow < 0
        ? "Cash flow deficit — review expenses"
        : "Cash flow stable"

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 px-4 lg:px-6">
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
