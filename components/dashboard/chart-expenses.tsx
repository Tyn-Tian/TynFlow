"use client";

import { useSearchParams } from "next/navigation";

import { ChartExpensesSkeleton } from "@/components/dashboard/skeleton/chart-expenses-skeleton";

import { Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import useRange from "@/hooks/use-range";
import useBudget from "@/hooks/use-budget";
import useTransactions from "@/hooks/use-transaction";
import { dashboardService } from "@/services/dashboard-service";
import { useMemo } from "react";

export function useExpenseChartData() {
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const { data: range, isLoading: isRangeLoading } = useRange();
  
  const activeStartDate = fromParam || range?.start_date;
  const activeEndDate = toParam || range?.end_date;

  const { data: transactions, isLoading: isTransactionsLoading } = useTransactions({
    type: "Expense",
    startDate: activeStartDate,
    endDate: activeEndDate,
  });

  const { data: budgetData, isLoading: isBudgetsLoading } = useBudget(true);
  const budgets = budgetData?.data;

  const isLoading = isRangeLoading || isTransactionsLoading || isBudgetsLoading;

  const { chartData, chartConfig } = useMemo(() => {
    if (!transactions || !budgets) {
      return {
        chartData: [],
        chartConfig: { value: { label: "Amount" } },
      };
    }

    const result = dashboardService.getExpenseChartData({
      transactions,
      budgets,
    });

    if (!result) {
      return {
        chartData: [],
        chartConfig: { value: { label: "Amount" } },
      };
    }

    return result;
  }, [transactions, budgets]);

  const fmt = (s?: string) => {
    if (!s) return null;
    const d = new Date(s);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const startLabel = fmt(activeStartDate);
  const endLabel = fmt(activeEndDate);

  return {
    chartData,
    chartConfig,
    startLabel,
    endLabel,
    isLoading,
  };
}

export function ChartExpenses() {
  const { chartData, chartConfig, startLabel, endLabel, isLoading } =
    useExpenseChartData();

  if (isLoading) return <ChartExpensesSkeleton />;

  const monthYear = new Date().toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  const rangeLabel =
    startLabel && endLabel ? `${startLabel} - ${endLabel}` : monthYear;

  return (
    <Card className="flex flex-col gap-0 py-4 sm:py-6">
      <CardHeader className="items-center pb-0 gap-0 px-4 sm:px-6">
        <CardTitle>Expense Allocation</CardTitle>
        <CardDescription>{rangeLabel}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 px-4 sm:px-6">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-75"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="value" nameKey="name" />
            <ChartLegend
              content={<ChartLegendContent nameKey="__key" />}
              className="-translate-y-2 flex-wrap gap-2 gap-x-4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
