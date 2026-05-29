"use client";

import { useSearchParams } from "next/navigation";

import { SectionCardsSkeleton } from "@/components/dashboard/skeleton/section-cards-skeleton";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils";
import useRange from "@/hooks/use-range";
import useTransactions from "@/hooks/use-transaction";
import { dashboardService } from "@/services/dashboard-service";
import { useMemo } from "react";

export function SectionCards() {
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const { data: range, isLoading: isRangeLoading } = useRange();

  const activeStartDate = fromParam || range?.start_date;
  const activeEndDate = toParam || range?.end_date;

  const { prevStartIso, prevEndIso } = useMemo(() => {
    if (!activeStartDate || !activeEndDate) {
      return { prevStartIso: undefined, prevEndIso: undefined };
    }
    const sd = new Date(activeStartDate);
    const ed = new Date(activeEndDate);

    if (isNaN(sd.getTime()) || isNaN(ed.getTime())) {
      return { prevStartIso: undefined, prevEndIso: undefined };
    }

    const prevSd = new Date(sd);
    const prevEd = new Date(ed);
    prevSd.setMonth(prevSd.getMonth() - 1);
    prevEd.setMonth(prevEd.getMonth() - 1);

    return {
      prevStartIso: prevSd.toISOString(),
      prevEndIso: prevEd.toISOString(),
    };
  }, [activeStartDate, activeEndDate]);

  const { data: incomeTxs, isLoading: isIncomeLoading } = useTransactions({
    type: "Income",
    startDate: activeStartDate,
    endDate: activeEndDate,
  });

  const { data: expenseTxs, isLoading: isExpenseLoading } = useTransactions({
    type: "Expense",
    startDate: activeStartDate,
    endDate: activeEndDate,
  });

  const { data: prevIncomeTxs, isLoading: isPrevIncomeLoading } = useTransactions({
    type: "Income",
    startDate: prevStartIso,
    endDate: prevEndIso,
  });

  const { data: prevExpenseTxs, isLoading: isPrevExpenseLoading } = useTransactions({
    type: "Expense",
    startDate: prevStartIso,
    endDate: prevEndIso,
  });

  const isLoading = isRangeLoading || isIncomeLoading || isExpenseLoading || isPrevIncomeLoading || isPrevExpenseLoading;

  const { incomeTotal, expenseTotal, incomeChange, expenseChange, cashFlow } =
    useMemo(() => {
      if (!incomeTxs || !expenseTxs || !prevIncomeTxs || !prevExpenseTxs) {
        return {
          incomeTotal: 0,
          expenseTotal: 0,
          incomeChange: 0,
          expenseChange: 0,
          cashFlow: 0,
        };
      }

      const result = dashboardService.getSummaries({
        incomeTxs,
        expenseTxs,
        prevIncomeTxs,
        prevExpenseTxs,
      });

      if (!result) {
        return {
          incomeTotal: 0,
          expenseTotal: 0,
          incomeChange: 0,
          expenseChange: 0,
          cashFlow: 0,
        };
      }

      return result;
    }, [incomeTxs, expenseTxs, prevIncomeTxs, prevExpenseTxs]);

  const formattedIncome = formatRupiah(incomeTotal);
  const formattedExpense = formatRupiah(expenseTotal);

  if (isLoading) {
    return <SectionCardsSkeleton />;
  }

  const formattedCashFlow = formatRupiah(cashFlow);
  const cashFlowFooter =
    cashFlow > 0
      ? "Cash flow improving — healthy"
      : cashFlow < 0
        ? "Cash flow deficit — review expenses"
        : "Cash flow stable";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 px-4 lg:px-6">
      <Card className="@container/card gap-2 py-4 sm:py-6">
        <CardHeader className="px-4 sm:px-6">
          <CardDescription>Total Income</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formattedIncome}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {incomeChange > 0 ? (
                <IconTrendingUp />
              ) : incomeChange < 0 ? (
                <IconTrendingDown />
              ) : (
                <IconTrendingUp />
              )}
              {incomeChange > 0
                ? `+${Math.round(incomeChange)}%`
                : incomeChange < 0
                  ? `${Math.round(incomeChange)}%`
                  : `0%`}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm px-4 sm:px-6">
          <div className="text-muted-foreground">
            Visitors for the last 6 months
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card gap-2 py-4 sm:py-6">
        <CardHeader className="px-4 sm:px-6">
          <CardDescription>Total Expense</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formattedExpense}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {expenseChange > 0 ? (
                <IconTrendingUp />
              ) : expenseChange < 0 ? (
                <IconTrendingDown />
              ) : (
                <IconTrendingUp />
              )}
              {expenseChange > 0
                ? `+${Math.round(expenseChange)}%`
                : expenseChange < 0
                  ? `${Math.round(expenseChange)}%`
                  : `0%`}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm px-4 sm:px-6">
          <div className="text-muted-foreground">
            Acquisition needs attention
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card gap-2 py-4 sm:py-6">
        <CardHeader className="px-4 sm:px-6">
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
        <CardFooter className="flex-col items-start gap-1.5 text-sm px-4 sm:px-6">
          <div className="text-muted-foreground">{cashFlowFooter}</div>
        </CardFooter>
      </Card>
    </div>
  );
}
