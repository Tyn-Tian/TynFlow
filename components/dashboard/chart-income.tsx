"use client"

import { Pie, PieChart } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

import React, { useEffect, useState } from "react"
import { getIncomeChartDataAction } from "@/actions/dashboard-actions"

type Slice = Record<string, string | number> & { name: string; value: number; fill: string; __key: string }

export function useIncomeChartData() {
    const [chartData, setChartData] = useState<Slice[]>([])
    const [chartConfig, setChartConfig] = useState<ChartConfig>({ value: { label: "Amount" } })
    const [startLabel, setStartLabel] = useState<string | null>(null)
    const [endLabel, setEndLabel] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true
            ; (async () => {
                try {
                    const data = await getIncomeChartDataAction()

                    if (!mounted) return

                    const fmt = (s?: string) => {
                        if (!s) return null
                        const d = new Date(s)
                        if (isNaN(d.getTime())) return null
                        return d.toLocaleString("en-US", { day: "2-digit", month: "long", year: "numeric" })
                    }

                    setChartData(data.chartData as Slice[])
                    setChartConfig(data.chartConfig)
                    setStartLabel(fmt(data.startDate))
                    setEndLabel(fmt(data.endDate))
                } catch (err) {
                    console.error(err)
                }
            })()

        return () => {
            mounted = false
        }
    }, [])

    return { chartData, chartConfig, startLabel, endLabel }
}

export function ChartIncome() {
    const { chartData, chartConfig, startLabel, endLabel } = useIncomeChartData()
    const monthYear = new Date().toLocaleString("en-US", { month: "long", year: "numeric" })
    const rangeLabel = startLabel && endLabel ? `${startLabel} - ${endLabel}` : monthYear

    return (
        <Card className="flex flex-col gap-0">
            <CardHeader className="items-center pb-0 gap-0">
                <CardTitle>Income Allocation</CardTitle>
                <CardDescription>{rangeLabel}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-75">
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
    )
}
