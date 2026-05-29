"use client"

import { useMemo } from "react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

import useTransactions from "@/hooks/use-transaction"
import { dashboardService } from "@/services/dashboard-service"
import { ChartWeeklyExpenseSkeleton } from "@/components/dashboard/skeleton/chart-weekly-expense-skeleton"

function getStartAndEndOfWeek() {
    const now = new Date()
    const day = now.getDay()
    const diffToMonday = day === 0 ? -6 : 1 - day

    const start = new Date(now)
    start.setDate(now.getDate() + diffToMonday)
    start.setHours(0, 0, 0, 0)

    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)

    return { start, end }
}

export function useWeeklyExpenseChartData() {
    const { start, end } = useMemo(() => getStartAndEndOfWeek(), [])

    const { data: transactions, isLoading } = useTransactions({
        type: "Expense",
        startDate: start.toISOString(),
        endDate: end.toISOString(),
    })

    const { chartData, chartConfig } = useMemo(() => {
        if (!transactions) {
            return {
                chartData: [],
                chartConfig: { amount: { label: "Amount", color: "var(--chart-3)" } },
            }
        }

        return dashboardService.getWeeklyExpenseChartData({ transactions })
    }, [transactions])

    const fmt = (d: Date) => d.toLocaleString("en-US", { month: "short", day: "numeric" })
    const rangeLabel = `${fmt(start)} - ${fmt(end)}`

    return {
        chartData,
        chartConfig,
        rangeLabel,
        isLoading,
    }
}

export function ChartWeeklyExpense() {
    const { chartData, chartConfig, rangeLabel, isLoading } = useWeeklyExpenseChartData()

    if (isLoading) return <ChartWeeklyExpenseSkeleton />

    return (
        <Card className="flex-1 flex flex-col py-4 sm:py-6 md:col-span-2">
            <CardHeader className="px-4 sm:px-6">
                <CardTitle>Weekly Expense Overview</CardTitle>
                <CardDescription>{rangeLabel}</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 flex-1">
                <ChartContainer config={chartConfig} className="w-full h-full min-h-[300px]">
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        layout="vertical"
                        margin={{
                            top: 20,
                            left: 0,
                            right: 20,
                        }}
                    >
                        <CartesianGrid horizontal={false} vertical={false} />
                        <XAxis
                            type="number"
                            hide
                        />
                        <YAxis
                            dataKey="day"
                            type="category"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="amount" radius={5} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
