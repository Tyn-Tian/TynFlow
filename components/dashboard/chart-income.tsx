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

export const description = "A pie chart with a legend"

import React, { useEffect, useState } from "react"
import { createClient as createBrowserClient } from "@/lib/supabase/client"

type Slice = Record<string, string | number> & { name: string; value: number; fill: string; __key: string }
type TxRow = { amount?: number | string; name?: string | null }

export function useIncomeChartData() {
    const [chartData, setChartData] = useState<Slice[]>([])
    const [chartConfig, setChartConfig] = useState<ChartConfig>({ value: { label: "Amount" } })

    useEffect(() => {
        let mounted = true

        ;(async () => {
            try {
                const supabase = createBrowserClient()

                const { data: txs } = await supabase
                    .from("transactions")
                    .select("amount, name")
                    .eq("type", "Income")

                const txData = (txs ?? []) as TxRow[]

                const grouped = txData.reduce<Record<string, number>>((acc, t: TxRow) => {
                    const name = t.name ?? "Unnamed"
                    acc[name] = (acc[name] ?? 0) + (typeof t.amount === "number" ? t.amount : Number(t.amount || 0))
                    return acc
                }, {})

                const paletteSize = 5
                const entries = Object.entries(grouped)

                const data = entries.map(([name, value], idx) => {
                    const key = `i_${idx}`
                    return {
                        name,
                        value,
                        fill: `var(--color-${key})`,
                        [key]: name,
                        __key: key,
                    }
                })

                const config: ChartConfig = { value: { label: "Amount" } }
                data.forEach((d, idx) => {
                    const key = d.__key
                    config[key] = {
                        label: `${d.name}`,
                        color: `var(--chart-${(idx % paletteSize) + 1})`,
                    }
                })

                if (!mounted) return
                setChartData(data)
                setChartConfig(config)
            } catch (err) {
                console.error(err)
            }
        })()

        return () => {
            mounted = false
        }
    }, [])

    return { chartData, chartConfig }
}

export function ChartIncome() {
    const { chartData, chartConfig } = useIncomeChartData()
    const monthYear = new Date().toLocaleString("en-US", { month: "long", year: "numeric" })

    return (
        <Card className="flex flex-col gap-0">
            <CardHeader className="items-center pb-0 gap-0">
                <CardTitle>Income Allocation</CardTitle>
                <CardDescription>{monthYear}</CardDescription>
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
