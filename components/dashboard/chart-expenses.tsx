"use client";

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
import { dashboardService2 } from "@/services/dashboard-service.new";
import { useMemo } from "react";

export function useExpenseChartData() {
  const { data: range } = useRange();
  const { data: transactions } = useTransactions({
    type: "Expense",
    startDate: range?.start_date,
    endDate: range?.end_date,
  });

  const { data: budgets } = useBudget();

  const { chartData, chartConfig } = useMemo(() => {
    if (!transactions || !budgets) {
      return { 
        chartData: [], 
        chartConfig: { value: { label: "Amount" } } 
      };
    }

    const result = dashboardService2.getExpenseChartData({
      transactions,
      budgets,
    });

    if (!result) {
      return { 
        chartData: [], 
        chartConfig: { value: { label: "Amount" } } 
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

  const startLabel = fmt(range?.start_date);
  const endLabel = fmt(range?.end_date);

  return { 
    chartData, 
    chartConfig, 
    startLabel, 
    endLabel,
  };
}

export function ChartExpenses() {
  const { chartData, chartConfig, startLabel, endLabel } =
    useExpenseChartData();
  const monthYear = new Date().toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  const rangeLabel =
    startLabel && endLabel ? `${startLabel} - ${endLabel}` : monthYear;

  return (
    <Card className="flex flex-col gap-0">
      <CardHeader className="items-center pb-0 gap-0">
        <CardTitle>Expense Allocation</CardTitle>
        <CardDescription>{rangeLabel}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
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
