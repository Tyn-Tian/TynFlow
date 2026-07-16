"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HeatmapChart, HeatmapCells, HeatmapXAxis, HeatmapYAxis, HeatmapTooltip, HeatmapLegend } from "@/components/charts/heatmap";
import useTransactions from "@/hooks/use-transaction";
import { eachDayOfInterval, startOfWeek, endOfWeek, format, subMonths } from "date-fns";
import type { HeatmapColumn } from "@/components/charts/heatmap/heatmap-context";
import { ChartHeatmapTransactionsSkeleton } from "./skeleton/chart-heatmap-transactions-skeleton";
import { Transaction } from "@/types/transaction-type";
import { useIsMobile } from "@/hooks/use-mobile";

function buildHeatmapData(rawData: Transaction[], startDate: Date, endDate: Date) {
  const dataMap = new Map<string, number>();
  for (const item of rawData) {
    if (!item.date) continue;
    const dateStr = item.date.split("T")[0];
    dataMap.set(dateStr, (dataMap.get(dateStr) || 0) + 1);
  }

  const gridStart = startOfWeek(startDate);
  const gridEnd = endOfWeek(endDate);

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const columns: HeatmapColumn[] = [];
  let currentWeek = -1;

  days.forEach((day) => {
    const dayOfWeek = day.getDay(); // 0 to 6
    if (dayOfWeek === 0 || columns.length === 0) {
      currentWeek++;
      columns.push({ bin: currentWeek, bins: [] });
    }

    const dateStr = format(day, "yyyy-MM-dd");
    const count = dataMap.get(dateStr) || 0;

    columns[columns.length - 1].bins.push({
      bin: dayOfWeek,
      count,
      date: day
    });
  });

  return columns;
}

export function ChartHeatmapTransactions() {
  const isMobile = useIsMobile();

  const { endDate, startDate } = useMemo(() => {
    const end = new Date();
    const start = subMonths(end, 12);
    return { endDate: end, startDate: start };
  }, []);

  const { data: transactions, isLoading } = useTransactions({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  const heatmapData = useMemo(() => {
    if (!transactions) return [];
    return buildHeatmapData(transactions?.data, startDate, endDate);
  }, [transactions, startDate, endDate]);

  if (isLoading) {
    return <ChartHeatmapTransactionsSkeleton />
  }

  return (
    <Card className="flex flex-col py-4 sm:py-6">
      <CardHeader className="items-center pb-0 gap-0 px-4 sm:px-6">
        <CardTitle>Transaction Activity</CardTitle>
        <CardDescription>Daily transactions</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 px-4 sm:px-6">
        <div className="w-full overflow-x-auto pb-4">
          <div className="min-w-[800px]">
            <HeatmapChart
              data={heatmapData}
              layout="fluid"
              gap={isMobile ? 3 : 4}
              className="w-full"
            >
              <HeatmapCells cornerRadius={isMobile ? 3 : 4} />
              <HeatmapXAxis />
              <HeatmapYAxis />
              <HeatmapTooltip />
              <HeatmapLegend />
            </HeatmapChart>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
