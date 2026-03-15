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

type BudgetSlice = Record<string, string | number> & { name: string; value: number; fill: string; __key: string }
type TxRow = { amount?: number | string; budget_id?: string | null }
type Budget = { id: string; name: string }

export function useExpenseChartData() {
    const [chartData, setChartData] = useState<BudgetSlice[]>([])
    const [chartConfig, setChartConfig] = useState<ChartConfig>({ value: { label: "Amount" } })

    useEffect(() => {
        let mounted = true

        ;(async () => {
            try {
                const supabase = createBrowserClient()

                const { data: txs } = await supabase
                    .from("transactions")
                    .select("amount, budget_id")
                    .eq("type", "Expense")

                const txData = (txs ?? []) as TxRow[]
                const budgetIds = Array.from(new Set(txData.map((t: TxRow) => t.budget_id).filter(Boolean)))

                const budgetsMap = new Map<string, string>()
                if (budgetIds.length) {
                    const { data: budgets } = await supabase.from("budgets").select("id, name").in("id", budgetIds)
                    ;(budgets ?? []).forEach((b: Budget) => budgetsMap.set(b.id, b.name))
                }

                const grouped = txData.reduce<Record<string, number>>((acc, t: TxRow) => {
                    const bid = t.budget_id ?? "__uncategorized__"
                    const name = budgetsMap.get(bid) ?? (bid === "__uncategorized__" ? "Uncategorized" : "Unknown")
                    acc[name] = (acc[name] ?? 0) + (typeof t.amount === "number" ? t.amount : Number(t.amount || 0))
                    return acc
                }, {})

                const paletteSize = 5
                const entries = Object.entries(grouped)

                const data = entries.map(([name, value], idx) => {
                    const key = `b_${idx}`
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
                    config[key] = { label: d.name, color: `var(--chart-${(idx % paletteSize) + 1})` }
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

export function ChartExpenses() {
    const { chartData, chartConfig } = useExpenseChartData()
    const monthYear = new Date().toLocaleString("en-US", { month: "long", year: "numeric" })

    return (
        <Card className="flex flex-col gap-0">
            <CardHeader className="items-center pb-0 gap-0">
                <CardTitle>Expense Allocation</CardTitle>
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
