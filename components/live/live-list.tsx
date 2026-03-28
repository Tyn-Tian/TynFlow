"use client"

import { useMemo, useState } from "react"
import { IconBolt, IconMoodEmpty, IconReceiptRupee, IconTrendingUp } from "@tabler/icons-react"

import { DeleteLiveDialog } from "./delete-live-dialog"
import { EditLiveDialog } from "./edit-live-dialog"
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
    getLiveSalesRate,
    hydrateLiveItems,
    type LiveItem,
} from "@/components/live/live-data"

type LiveListProps = {
    lives: LiveItem[]
}

export function LiveList({ lives }: LiveListProps) {
    const [openId, setOpenId] = useState<string | null>(null)
    const transactions = useMemo(() => hydrateLiveItems(lives), [lives])

    if (transactions.length === 0) {
        return (
            <Empty className="rounded-2xl border bg-card">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <IconMoodEmpty className="size-5" />
                    </EmptyMedia>
                    <EmptyTitle>Belum ada data live</EmptyTitle>
                    <EmptyDescription>
                        Tabel `lives` masih kosong atau belum berisi data yang sesuai.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    const groups = transactions.reduce<Record<string, typeof transactions>>((acc, item) => {
        const date = new Date(item.date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        ;(acc[monthKey] ??= []).push(item)
        return acc
    }, {})

    const sortedMonths = Object.keys(groups).sort(
        (a, b) => new Date(`${b}-01`).getTime() - new Date(`${a}-01`).getTime()
    )

    return (
        <div className="space-y-6">
            {sortedMonths.map((monthKey) => {
                const monthItems = groups[monthKey]
                const monthDate = new Date(`${monthKey}-01`)
                const monthLabel = monthDate.toLocaleDateString("id-ID", {
                    month: "long",
                    year: "numeric",
                })
                const monthTotal = monthItems.reduce((sum, item) => sum + item.total, 0)

                return (
                    <div key={monthKey} className="space-y-4">
                        <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex size-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <IconBolt className="size-4" />
                                </span>
                                <div>
                                    <p className="text-sm font-medium">Live Summary</p>
                                    <p className="text-xs text-muted-foreground capitalize">{monthLabel}</p>
                                </div>
                            </div>
                            <p className="text-sm font-bold tabular-nums">{formatRupiah(monthTotal)}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {monthItems.map((item) => {
                                const isOpen = openId === item.id
                                const formattedDate = new Date(item.date).toLocaleDateString("id-ID", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })

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
                                                <span className={`inline-flex h-9 w-9 items-center justify-center rounded-md ${item.type === "Lembur" ? "bg-amber-500/10" : "bg-emerald-500/10"}`}>
                                                    <IconReceiptRupee size={20} className={item.type === "Lembur" ? "text-amber-500" : "text-emerald-400"} />
                                                </span>
                                                <div>
                                                    <CardTitle className="text-base">{formattedDate}</CardTitle>
                                                    <p className="text-sm text-muted-foreground">{item.type}</p>
                                                </div>
                                            </div>
                                            <CardAction className="self-center text-sm font-bold tabular-nums">
                                                {formatRupiah(item.total)}
                                            </CardAction>
                                        </CardHeader>

                                        {isOpen && (
                                            <CardContent>
                                                <div className="rounded-xl border bg-muted/20 p-4">
                                                    <div className="mb-4 flex items-start justify-between gap-3">
                                                        <div>
                                                            <p className="text-sm font-medium">Rincian perhitungan live</p>
                                                            <p className="text-xs text-muted-foreground">Data live diambil langsung dari tabel Supabase `lives`.</p>
                                                        </div>
                                                        <span className="inline-flex items-center gap-1 rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                                            <IconTrendingUp className="size-3.5" />
                                                            {item.sales} sales
                                                        </span>
                                                    </div>

                                                    <div className="space-y-3 text-sm">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-muted-foreground">Subtotal live</span>
                                                            <span className="font-medium">{item.sessionCount} × {formatRupiah(item.baseRate)} = {formatRupiah(item.baseTotal)}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-muted-foreground">Bonus sales</span>
                                                            <span className="font-medium">{item.sales} × {formatRupiah(getLiveSalesRate())} = {formatRupiah(item.salesBonus)}</span>
                                                        </div>
                                                        <div className="h-px bg-border" />
                                                        <div className="flex items-center justify-between text-sm font-semibold">
                                                            <span>Total live</span>
                                                            <span>{formatRupiah(item.total)}</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 flex gap-2 justify-end">
                                                        <EditLiveDialog live={item} />
                                                        <DeleteLiveDialog liveId={item.id} />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
