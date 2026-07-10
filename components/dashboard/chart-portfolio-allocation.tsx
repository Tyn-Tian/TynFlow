"use client";

import { useMemo } from "react";
import { Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { ChartPortfolioAllocationSkeleton } from "@/components/dashboard/skeleton/chart-portfolio-allocation-skeleton";
import usePortfolio from "@/hooks/use-portfolio";
import { dashboardService } from "@/services/dashboard-service";
import PortfolioOverviewChart from "@/components/portfolio/portfolio-overview-chart";

export function usePortfolioAllocationChartData() {
  const { data, isLoading } = usePortfolio();

  const portfolios = useMemo(() => data?.data ?? [], [data?.data]);

  const { chartData, chartConfig } = useMemo(() => {
    if (!portfolios || portfolios.length === 0) {
      return {
        chartData: [],
        chartConfig: { value: { label: "Current Value" } },
      };
    }

    const result = dashboardService.getPortfolioChartData({
      portfolios,
    });

    if (!result) {
      return {
        chartData: [],
        chartConfig: { value: { label: "Current Value" } },
      };
    }

    return result;
  }, [portfolios]);

  return {
    chartData,
    chartConfig,
    isLoading,
  };
}

export function ChartPortfolioAllocation() {
  const { chartData, chartConfig, isLoading } = usePortfolioAllocationChartData();

  if (isLoading) return <ChartPortfolioAllocationSkeleton />;

  const monthYear = new Date().toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <Card className="flex flex-col gap-0 py-4 sm:py-6 w-full">
      <CardHeader className="items-center pb-0 gap-0 px-4 sm:px-6">
        <CardTitle>Portfolio Allocation</CardTitle>
        <CardDescription>{monthYear}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 px-4 sm:px-6">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-75"
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name, item) => (
                    <>
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="flex flex-1 justify-between items-center ml-1">
                        <span className="text-muted-foreground">{name}</span>
                        <span className="font-mono font-medium tabular-nums text-foreground ml-3">
                          {item.payload.percentage}
                        </span>
                      </div>
                    </>
                  )}
                />
              }
            />
            <Pie data={chartData} dataKey="value" nameKey="name" />
            <ChartLegend
              content={<ChartLegendContent nameKey="__key" />}
              className="-translate-y-2 flex-wrap gap-2 gap-x-4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 pt-4 px-4 sm:px-6 border-t mt-auto">
        <div className="flex w-full items-center justify-between">
          <div className="font-medium text-sm">Portfolio Overview</div>
        </div>
        <PortfolioOverviewChart variant="minimal" className="h-[150px]" />
      </CardFooter>
    </Card>
  );
}
