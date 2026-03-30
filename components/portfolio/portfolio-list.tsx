"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { IconLoader, IconMoodEmpty, IconTargetArrow } from "@tabler/icons-react"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import { DeletePortfolioDialog } from "@/components/portfolio/delete-portfolio-dialog"
import { EditPortfolioDialog } from "@/components/portfolio/edit-portfolio-dialog"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardAction,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { formatRupiah } from "@/lib/utils"
import {
    getProgressWidthClass,
    normalizePortfolioItems,
    portfolioTypeConfig,
    type PortfolioItem,
} from "@/components/portfolio/portfolio-data"

export function PortfolioList() {
    const supabase = useMemo(() => createClient(), [])
    const [openId, setOpenId] = useState<string | null>(null)
    const [portfolios, setPortfolios] = useState<PortfolioItem[] | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchPortfolios = useCallback(async () => {
        setLoading(true)

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                setPortfolios([])
                return
            }

            const { data, error } = await supabase
                .from("portfolios")
                .select("id, name, type, target, invested, current_value")
                .eq("user_id", user.id)
                .order("name", { ascending: true })

            if (error) {
                throw error
            }

            setPortfolios(normalizePortfolioItems(data ?? []))
        } catch (error) {
            setPortfolios([])
            toast.error("Failed", {
                description: error instanceof Error ? error.message : "Failed to load portfolios.",
                duration: 3000,
            })
        } finally {
            setLoading(false)
        }
    }, [supabase])

    useEffect(() => {
        let mounted = true

        void (async () => {
            if (!mounted) return
            await fetchPortfolios()
        })()

        const handler = () => {
            void fetchPortfolios()
        }

        window.addEventListener("portfolios:changed", handler)

        return () => {
            mounted = false
            window.removeEventListener("portfolios:changed", handler)
        }
    }, [fetchPortfolios])

    const summary = useMemo(() => {
        const items = portfolios ?? []
        const totalInvested = items.reduce((sum, item) => sum + item.invested, 0)
        const totalCurrentValue = items.reduce((sum, item) => sum + item.currentValue, 0)
        const totalProfitLoss = totalCurrentValue - totalInvested

        return {
            totalInvested,
            totalCurrentValue,
            totalProfitLoss,
            totalProfitLossPct: totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0,
        }
    }, [portfolios])

    const monthYear = new Date().toLocaleString("en-US", { month: "long", year: "numeric" })

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
                <IconLoader className="size-5 animate-spin" />
            </div>
        )
    }

    if (!portfolios || portfolios.length === 0) {
        return (
            <Empty className="rounded-2xl border bg-card">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <IconMoodEmpty className="size-5" />
                    </EmptyMedia>
                    <EmptyTitle>No portfolios yet</EmptyTitle>
                    <EmptyDescription>
                        Add your first portfolio to start tracking targets and current value.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    const summaryProfitLossColor =
        summary.totalProfitLoss >= 0
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-rose-600 dark:text-rose-400"

    const summaryProfitLossLabel = `${summary.totalProfitLossPct >= 0 ? "+" : ""}${summary.totalProfitLossPct.toFixed(1)}%`

    return (
        <>
            <div className="col-span-3 flex items-center justify-between rounded-xl border bg-card px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="inline-flex size-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <IconTargetArrow className="size-4" />
                    </span>
                    <div>
                        <p className="text-sm font-medium">Portfolio Overview</p>
                        <p className="text-xs text-muted-foreground">{monthYear}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold tabular-nums text-foreground">
                        {formatRupiah(summary.totalCurrentValue)}
                    </p>
                    <p className={`text-xs font-medium ${summaryProfitLossColor}`}>
                        {formatRupiah(summary.totalProfitLoss)} ({summaryProfitLossLabel})
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {portfolios.map((item) => {
                    const progressPct = item.target > 0 ? Math.round((item.currentValue / item.target) * 100) : 0
                    const safeProgress = Math.min(progressPct, 100)
                    const gapToTarget = Math.max(item.target - item.currentValue, 0)
                    const profitLoss = item.currentValue - item.invested
                    const profitLossPct = item.invested > 0 ? (profitLoss / item.invested) * 100 : 0
                    const profitLossLabel = `${profitLossPct >= 0 ? "+" : ""}${profitLossPct.toFixed(1)}%`
                    const isOpen = openId === item.id
                    const typeConfig = portfolioTypeConfig[item.type]
                    const TypeIcon = typeConfig.icon
                    const progressWidthClass = getProgressWidthClass(safeProgress)

                    const progressColor =
                        progressPct >= 80
                            ? "bg-emerald-500 dark:bg-emerald-400"
                            : progressPct >= 50
                                ? "bg-amber-400 dark:bg-amber-500"
                                : "bg-rose-500 dark:bg-rose-400"

                    const profitLossColor =
                        profitLoss >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"

                    return (
                        <Card
                            key={item.id}
                            className="@container/card cursor-pointer gap-2 self-start transition-shadow hover:shadow-md"
                            onClick={() => setOpenId(isOpen ? null : item.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault()
                                    setOpenId(isOpen ? null : item.id)
                                }
                            }}
                        >
                            <CardHeader className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-muted/60">
                                        <TypeIcon size={20} className={typeConfig.iconClassName} />
                                    </span>
                                    <div>
                                        <CardTitle>{item.name}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{item.type}</p>
                                    </div>
                                </div>
                                <CardAction className="self-center text-sm font-bold tabular-nums">
                                    {formatRupiah(item.currentValue)}
                                </CardAction>
                            </CardHeader>

                            <CardContent>
                                <div className="my-2 space-y-2">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Target Progress</span>
                                        <span>{progressPct}%</span>
                                    </div>
                                    <div className="h-1 w-full rounded-full bg-muted/30">
                                        <div className={`h-1 rounded-full transition-all ${progressColor} ${progressWidthClass}`} />
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Current Value: {formatRupiah(item.currentValue)}</span>
                                        <span>Target: {formatRupiah(item.target)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Invested: {formatRupiah(item.invested)}</span>
                                        <span className={`font-medium ${profitLossColor}`}>
                                            {formatRupiah(profitLoss)} ({profitLossLabel})
                                        </span>
                                    </div>
                                </div>
                            </CardContent>

                            {isOpen && (
                                <CardContent>
                                    <div className="rounded-xl border bg-muted/20 p-4">
                                        <div className="mb-4 flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-medium">Portfolio Summary</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Portfolio data is loaded directly from Supabase `portfolios`.
                                                </p>
                                            </div>
                                            <Badge variant="outline" className={typeConfig.badgeClassName}>
                                                {item.type}
                                            </Badge>
                                        </div>

                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Invested</span>
                                                <span className="font-medium">{formatRupiah(item.invested)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Current Value</span>
                                                <span className="font-medium">{formatRupiah(item.currentValue)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Potential P/L</span>
                                                <span className={`font-medium ${profitLossColor}`}>
                                                    {formatRupiah(profitLoss)} ({profitLossLabel})
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Portfolio Target</span>
                                                <span className="font-medium">{formatRupiah(item.target)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Remaining to Target</span>
                                                <span className="font-medium">{formatRupiah(gapToTarget)}</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex justify-end gap-2">
                                            <EditPortfolioDialog portfolio={item} />
                                            <DeletePortfolioDialog portfolioId={item.id} />
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    )
                })}
            </div>
        </>
    )
}
