"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import React, { useEffect, useState } from "react"
import { getBarChartDataAction } from "@/actions/dashboard-actions"
import { formatRupiah } from "@/lib/utils"

export function useBarChartData() {
    const [chartData, setChartData] = useState<any[]>([])
    const [chartConfig, setChartConfig] = useState<ChartConfig>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true
        ;(async () => {
            try {
                const data = await getBarChartDataAction()
                if (!mounted) return
                setChartData(data.chartData)
                setChartConfig(data.chartConfig)
            } catch (err) {
                console.error(err)
            } finally {
                if (mounted) setLoading(false)
            }
        })()
        return () => {
            mounted = false
        }
    }, [])

    return { chartData, chartConfig, loading }
}

export function ChartBarTransactions() {
    const { chartData, chartConfig, loading } = useBarChartData()

    const monthsWithExpense = chartData.filter((m) => m.expense > 0)
    const avgExpense = monthsWithExpense.length > 0
        ? chartData.reduce((acc, curr) => acc + curr.expense, 0) / monthsWithExpense.length
        : 0
    
    const emergencyFund3 = avgExpense * 3
    const emergencyFund6 = avgExpense * 6
    const emergencyFund12 = avgExpense * 12

    if (loading) {
        return (
            <Card className="flex flex-col">
                <CardHeader className="items-center pb-0 gap-0">
                    <CardTitle>Transactions Overview</CardTitle>
                    <CardDescription>Last 6 Months</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0 min-h-[300px] flex items-center justify-center">
                    <div className="text-muted-foreground animate-pulse">Loading chart data...</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0 gap-0">
                <CardTitle>Transactions Overview</CardTitle>
                <CardDescription>Last 6 Months</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer config={chartConfig} className="mx-auto aspect-[16/9] max-h-[300px] w-full">
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
                        <Bar dataKey="income" fill="var(--color-income)" radius={8} />
                        <Bar dataKey="expense" fill="var(--color-expense)" radius={8} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm pt-4">
                <div className="flex gap-2 leading-none font-medium">
                    Emergency Fund Recommendation:
                </div>
                <div className="leading-none text-muted-foreground flex gap-2">
                    <span>3 months: <span className="text-foreground font-medium">{formatRupiah(emergencyFund3)}</span></span>
                    <span>|</span>
                    <span>6 months: <span className="text-foreground font-medium">{formatRupiah(emergencyFund6)}</span></span>
                    <span>|</span>
                    <span>12 months: <span className="text-foreground font-medium">{formatRupiah(emergencyFund12)}</span></span>
                </div>
            </CardFooter>
        </Card>
    )
}
