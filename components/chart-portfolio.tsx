"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "An interactive area chart"

const chartData = [
  { date: "2026-01-01", present: 138500000, capital: 138500000 },
  { date: "2026-02-28", present: 145370031, capital: 144525000 },
]

const chartConfig = {
  capital: { label: "Investment Capital", color: "#065f46" },
  present: { label: "Present Value", color: "#34d399" },
} satisfies ChartConfig

function formatRupiah(v: number) {
  return `Rp ${v.toLocaleString("id-ID")}`
}

export function ChartPortfolio() {
  return (
    <Card className="@container/card gap-0">
      <CardHeader className="gap-0">
        <CardTitle>Total Portfolio</CardTitle>
        <CardDescription>
          <span>Comparison of Investment Capital & Present Value</span>
        </CardDescription>
        <CardAction className="text-sm font-bold tabular-nums">
          {formatRupiah(chartData[chartData.length - 1].present)}
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-62.5 w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillPresent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-present)" stopOpacity={0.9} />
                <stop offset="95%" stopColor="var(--color-present)" stopOpacity={0.06} />
              </linearGradient>
              <linearGradient id="fillCapital" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-capital)" stopOpacity={0.9} />
                <stop offset="95%" stopColor="var(--color-capital)" stopOpacity={0.06} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area dataKey="capital" type="natural" fill="url(#fillCapital)" stroke="var(--color-capital)" stackId="a" />
            <Area dataKey="present" type="natural" fill="url(#fillPresent)" stroke="var(--color-present)" stackId="a" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
