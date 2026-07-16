"use client";

import { ChartBarTransactionsSkeleton } from "@/components/dashboard/skeleton/chart-bar-transactions-skeleton";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useMemo } from "react";
import { dashboardService } from "@/services/dashboard-service";
import useTransactions from "@/hooks/use-transaction";
import { formatRupiah } from "@/lib/utils";
import { MonthData } from "@/types/dashboard-type";
import { useIsMobile } from "@/hooks/use-mobile";

export function useBarChartData() {
  const { months, startDate, endDate } = useMemo(() => {
    const now = new Date();
    const generatedMonths: MonthData[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      generatedMonths.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: d.toLocaleString("en-US", { month: "long" }),
        income: 0,
        expense: 0,
      });
    }

    return {
      months: generatedMonths,
      startDate: new Date(
        generatedMonths[0].year,
        generatedMonths[0].month,
        1,
      ).toISOString(),
      endDate: new Date(
        generatedMonths[5].year,
        generatedMonths[5].month + 1,
        0,
        23,
        59,
        59,
      ).toISOString(),
    };
  }, []);

  const { data: transactions, isLoading } = useTransactions({
    startDate,
    endDate,
  });

  const { chartData, chartConfig } = useMemo(() => {
    if (!transactions) {
      return {
        chartData: [],
        chartConfig: {},
      };
    }

    const result = dashboardService.getBarChartData({
      transactions: transactions?.data,
      months,
    });

    if (!result) {
      return {
        chartData: [],
        chartConfig: { value: { label: "Amount" } },
      };
    }

    return result;
  }, [transactions, months]);

  return {
    chartData,
    chartConfig,
    isLoading,
  };
}

export function ChartBarTransactions() {
  const isMobile = useIsMobile();
  const { chartData, chartConfig, isLoading } = useBarChartData();

  const monthsWithExpense = chartData.filter((m) => m.expense > 0);
  const avgExpense =
    monthsWithExpense.length > 0
      ? chartData.reduce((acc, curr) => acc + curr.expense, 0) /
        monthsWithExpense.length
      : 0;

  const emergencyFund3 = avgExpense * 3;
  const emergencyFund6 = avgExpense * 6;
  const emergencyFund12 = avgExpense * 12;

  if (isLoading) {
    return <ChartBarTransactionsSkeleton />;
  }

  return (
    <Card className="flex flex-col py-4 sm:py-6">
      <CardHeader className="items-center pb-0 gap-0 px-4 sm:px-6">
        <CardTitle>Transactions Overview</CardTitle>
        <CardDescription>Last 6 Months</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 px-4 sm:px-6">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-video max-h-[300px] w-full"
        >
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="income" fill="var(--color-income)" radius={isMobile ? 4 : 8} />
            <Bar dataKey="expense" fill="var(--color-expense)" radius={isMobile ? 4 : 8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm pt-4">
        <div className="flex gap-2 leading-none font-medium">
          Emergency Fund Recommendation:
        </div>
        <div className="leading-none text-muted-foreground flex gap-2">
          <span>
            3 months:{" "}
            <span className="text-foreground font-medium">
              {formatRupiah(emergencyFund3)}
            </span>
          </span>
          <span>|</span>
          <span>
            6 months:{" "}
            <span className="text-foreground font-medium">
              {formatRupiah(emergencyFund6)}
            </span>
          </span>
          <span>|</span>
          <span>
            12 months:{" "}
            <span className="text-foreground font-medium">
              {formatRupiah(emergencyFund12)}
            </span>
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
