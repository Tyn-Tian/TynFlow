"use client"

import { Line, LineChart, CartesianGrid, XAxis } from "recharts"

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
import { formatRupiah } from "@/lib/utils"

export const description = "An interactive area chart"

const chartData = [
  { month: "Jan", present: 138500000, capital: 138500000 },
  { month: "Feb", present: 145370031, capital: 144525000 },
  { month: "Mar", present: 143895000, capital: 148400000 },
]

const chartConfig = {
  capital: { label: "Investment Capital", color: "#065f46" },
  present: { label: "Present Value", color: "#34d399" },
} satisfies ChartConfig

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
          <LineChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                return value
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return value
                  }}
                  indicator="dot"
                />
              }
            />
            <Line dataKey="capital" type="natural" stroke="var(--color-capital)" strokeWidth={2} dot={false} />
            <Line dataKey="present" type="natural" stroke="var(--color-present)" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
