"use client";

import Grid from "../charts/grid";
import LineChart, { Line } from "../charts/line-chart";
import { ChartTooltip } from "../charts/tooltip";
import XAxis from "../charts/x-axis";
import { curveLinear } from "@visx/curve";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";

import { formatRupiah } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { portfolioService } from "@/services/portfolio-service";
import { useIsMobile } from "@/hooks/use-mobile";

export default function PortfolioOverviewChart() {
    const isMobile = useIsMobile();

    const { data: snapshots, isLoading } = useQuery({
        queryKey: ["portfolio-snapshots"],
        queryFn: async () => await portfolioService.getSnapshots(),
    });

    const chartData = snapshots?.map(snapshot => ({
        date: new Date(snapshot.created_at),
        invested: snapshot.invested,
        current_value: snapshot.current_value,
    })) || [];

    if (isLoading) {
        return (
            <Skeleton className="h-[300px] w-full rounded-xl" />
        )
    }

    return (
        <Card className="col-span-3">
            <CardHeader className="gap-0">
                <CardTitle>Portfolio Overview</CardTitle>
                <CardDescription>
                    Performance over time
                </CardDescription>
            </CardHeader>
            <CardContent>
                {chartData.length > 0 ? (
                    <LineChart
                        data={chartData}
                        margin={{ top: 10, right: isMobile ? 10 : 30, bottom: 10, left: isMobile ? 10 : 30 }}
                        className="h-[300px] w-full"
                        aspectRatio="auto"
                        yDomainFromData={true}
                    >
                        <Grid horizontal />
                        <Line curve={curveLinear} dataKey="invested" stroke="#10b981" strokeWidth={2} />
                        <Line curve={curveLinear} dataKey="current_value" stroke="#d946ef" strokeWidth={2} />
                        <XAxis />
                        <ChartTooltip
                            rows={(point) => [
                                {
                                    color: "#10b981",
                                    label: "Invested",
                                    value: formatRupiah(point.invested as number)
                                },
                                {
                                    color: "#d946ef",
                                    label: "Current Value",
                                    value: formatRupiah(point.current_value as number)
                                }
                            ]}
                        />
                    </LineChart>
                ) : (
                    <div className="flex h-[300px] w-full items-center justify-center text-sm text-muted-foreground">
                        No data available
                    </div>
                )}
            </CardContent>
        </Card>
    )
}