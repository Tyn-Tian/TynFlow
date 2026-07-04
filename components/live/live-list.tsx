"use client"

import { LiveListSkeleton } from "@/components/live/skeleton/live-list-skeleton"

import { useMemo, useState, useRef, useEffect } from "react"
import {
    IconBolt,
    IconCheck,
    IconCopy,
    IconMoodEmpty,
    IconReceiptRupee,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { useWindowVirtualizer } from "@tanstack/react-virtual"

import { DeleteLiveDialog } from "./delete-live-dialog"
import { EditLiveDialog } from "./edit-live-dialog"
import { Button } from "@/components/ui/button"
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
    LIVE_PLATFORMS,
    type HydratedLiveItem,
} from "@/components/live/live-data"
import { useQuery } from "@tanstack/react-query"
import { liveApi } from "@/lib/api/live-api"
import { useIsMobile } from "@/hooks/use-mobile"

type FlatItem = 
  | { type: "header"; monthKey: string; items: HydratedLiveItem[] }
  | { type: "row"; items: HydratedLiveItem[] };

export function LiveList() {
    const [openId, setOpenId] = useState<string | null>(null)
    const [copiedMonth, setCopiedMonth] = useState<string | null>(null)
    const isMobile = useIsMobile()

    const { data: lives, isLoading } = useQuery({
        queryKey: ["lives"],
        queryFn: async () => await liveApi.getAll(),
    })

    const transactions = useMemo(() => hydrateLiveItems(lives ?? []), [lives])
    const groupedMonths = useMemo(() => {
        const groups = transactions.reduce<Record<string, HydratedLiveItem[]>>((acc, item) => {
            const date = new Date(item.date)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
            ;(acc[monthKey] ??= []).push(item)
            return acc
        }, {})

        const sortedMonths = Object.keys(groups).sort(
            (a, b) => new Date(`${b}-01`).getTime() - new Date(`${a}-01`).getTime()
        )

        return { groups, sortedMonths }
    }, [transactions])

    const flatData = useMemo<FlatItem[]>(() => {
        const flat: FlatItem[] = [];
        groupedMonths.sortedMonths.forEach(monthKey => {
            const monthItems = groupedMonths.groups[monthKey];
            flat.push({ type: 'header', monthKey, items: monthItems });
            
            if (!isMobile) {
                for (let i = 0; i < monthItems.length; i += 2) {
                    flat.push({ type: 'row', items: monthItems.slice(i, i + 2) });
                }
            } else {
                monthItems.forEach(item => {
                    flat.push({ type: 'row', items: [item] });
                });
            }
        });
        return flat;
    }, [groupedMonths, isMobile]);

    const listRef = useRef<HTMLDivElement>(null);
    const [scrollMargin, setScrollMargin] = useState(0);

    useEffect(() => {
        if (listRef.current) {
            setScrollMargin(listRef.current.offsetTop);
        }
    }, []);

    const virtualizer = useWindowVirtualizer({
        count: flatData.length,
        estimateSize: (index) => flatData[index].type === 'header' ? 70 : 120,
        overscan: 5,
        scrollMargin,
    });

    if (isLoading) {
        return <LiveListSkeleton />;
    }

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

    async function writeTextToClipboard(text: string) {
        if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text)
            return
        }

        const textArea = document.createElement("textarea")
        textArea.value = text
        textArea.setAttribute("readonly", "")
        textArea.style.position = "fixed"
        textArea.style.opacity = "0"
        document.body.appendChild(textArea)
        textArea.select()

        const copied = document.execCommand("copy")
        document.body.removeChild(textArea)

        if (!copied) {
            throw new Error("Clipboard unavailable")
        }
    }

    async function copyMonthData(monthKey: string, monthItems: HydratedLiveItem[]) {
        const text = monthItems
            .slice()
            .sort((a, b) => {
                const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime()
                if (dateDiff !== 0) return dateDiff
                if (a.type === b.type) return a.id.localeCompare(b.id)
                return a.type === "Biasa" ? -1 : 1
            })
            .map((item) => {
                const liveDate = new Date(item.date)
                const day = String(liveDate.getDate()).padStart(2, "0")
                const monthLabel = liveDate.toLocaleDateString("id-ID", { month: "long" })
                const typeLabel = item.type === "Lembur" ? ` (${item.type})` : ""

                return `${day} ${monthLabel}${typeLabel}: Shopee ${item.shopee} pcs, TikTok ${item.tiktok} pcs`
            })
            .join("\n")

        if (!text) {
            toast.error("Gagal menyalin", {
                description: "Data live bulan ini tidak tersedia.",
                duration: 3000,
            })
            return
        }

        try {
            await writeTextToClipboard(text)
            setCopiedMonth(monthKey)
            toast.success("Berhasil disalin", {
                description: "Data live per bulan sudah masuk ke clipboard.",
                duration: 3000,
            })

            window.setTimeout(() => {
                setCopiedMonth((currentMonth) => (currentMonth === monthKey ? null : currentMonth))
            }, 2000)
        } catch {
            toast.error("Gagal menyalin", {
                description: "Clipboard tidak bisa diakses di browser ini.",
                duration: 3000,
            })
        }
    }

    return (
        <div ref={listRef} className="relative w-full" style={{ height: `${virtualizer.getTotalSize()}px` }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
                const rowData = flatData[virtualRow.index];
                
                return (
                    <div
                        key={virtualRow.key}
                        data-index={virtualRow.index}
                        ref={virtualizer.measureElement}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            transform: `translateY(${virtualRow.start}px)`,
                        }}
                        className="pb-4"
                    >
                        {rowData.type === 'header' ? (
                            <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex size-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                        <IconBolt className="size-4" />
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium">Live Summary</p>
                                        <p className="text-xs text-muted-foreground capitalize">
                                            {new Date(`${rowData.monthKey}-01`).toLocaleDateString("id-ID", {
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="cursor-pointer"
                                        onClick={() => copyMonthData(rowData.monthKey, rowData.items)}
                                        aria-label={`Copy data live bulan ${rowData.monthKey}`}
                                        title={`Copy data live bulan ${rowData.monthKey}`}
                                    >
                                        {copiedMonth === rowData.monthKey ? <IconCheck className="size-4" /> : <IconCopy className="size-4" />}
                                        {copiedMonth === rowData.monthKey ? "Tersalin" : "Copy"}
                                    </Button>
                                    <p className="text-sm font-bold tabular-nums">
                                        {formatRupiah(rowData.items.reduce((sum, item) => sum + item.total, 0))}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className={`grid grid-cols-1 ${!isMobile ? 'md:grid-cols-2' : ''} gap-4`}>
                                {rowData.items.map((item) => {
                                    const isOpen = openId === item.id;
                                    const formattedDate = new Date(item.date).toLocaleDateString("id-ID", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    });
                                    const totalSales = item.tiktok + item.shopee;

                                    return (
                                        <Card
                                            key={item.id}
                                            className="@container/card cursor-pointer gap-2 self-start transform-gpu will-change-transform py-4 sm:py-6 border-muted bg-card"
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
                                            <CardHeader className="flex items-center justify-between gap-3 px-4 sm:px-6">
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
                                                    <div className="rounded-xl border bg-secondary p-4">
                                                        <div className="mb-4 flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-medium">Rincian perhitungan live</p>
                                                                <p className="text-xs text-muted-foreground">Data live diambil langsung dari tabel Supabase `lives`.</p>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {LIVE_PLATFORMS.map((platform) => (
                                                                    <span key={platform.id} className="inline-flex items-center gap-1 rounded-full border bg-background px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                                                                        {platform.label}: {item[platform.id]}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3 text-sm">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-muted-foreground">Subtotal live</span>
                                                                <span className="font-medium">{item.sessionCount} × {formatRupiah(item.baseRate)} = {formatRupiah(item.baseTotal)}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-muted-foreground">Bonus sales ({totalSales} pcs)</span>
                                                                <span className="font-medium">{totalSales} × {formatRupiah(getLiveSalesRate())} = {formatRupiah(item.salesBonus)}</span>
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
                        )}
                    </div>
                )
            })}
        </div>
    )
}
