"use client";

import { ChartIncomeSkeleton } from "@/components/dashboard/skeleton/chart-income-skeleton";

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

import { useMemo } from "react";
import useRange from "@/hooks/use-range";
import useTransactions from "@/hooks/use-transaction";
import { dashboardService } from "@/services/dashboard-service";

export function useIncomeChartData() {
  const { data: range, isLoading: isRangeLoading } = useRange();
  const { data: transactions, isLoading: isTransactionsLoading } = useTransactions({
    type: "Income",
    startDate: range?.start_date,
    endDate: range?.end_date,
  });

  const isLoading = isRangeLoading || isTransactionsLoading;

  const { chartData, chartConfig } = useMemo(() => {
    if (!transactions) {
      return {
        chartData: [],
        chartConfig: { value: { label: "Amount" } },
      };
    }

    const result = dashboardService.getIncomeChartData({
      transactions,
    });

    if (!result) {
      return {
        chartData: [],
        chartConfig: { value: { label: "Amount" } },
      };
    }

    return result;
  }, [transactions]);

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
    isLoading,
  };
}

export function ChartIncome() {
  const { chartData, chartConfig, startLabel, endLabel, isLoading } = useIncomeChartData();

  if (isLoading) return <ChartIncomeSkeleton />;

  const monthYear = new Date().toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  const rangeLabel =
    startLabel && endLabel ? `${startLabel} - ${endLabel}` : monthYear;

  return (
    <Card className="flex flex-col gap-0 py-4 sm:py-6">
      <CardHeader className="items-center pb-0 gap-0 px-4 sm:px-6">
        <CardTitle>Income Allocation</CardTitle>
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
