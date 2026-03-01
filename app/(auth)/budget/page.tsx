import { SiteHeader } from "@/components/site-header"
import {
    Card,
    CardHeader,
    CardTitle,
    CardAction,
    CardContent,
} from "@/components/ui/card"
import {
    IconCalendarDollar,
    IconBurger,
    IconJoker,
    IconPerfume,
    IconTir,
    IconFilter,
} from "@tabler/icons-react"

const budgets = [
    { title: "Food & Drink", total: 1500000, leftover: 750000 + 639092, icon: IconBurger },
    { title: "Entertainment", total: 500000, leftover: 250000 + 30753, icon: IconJoker },
    { title: "Beauty & Apparel", total: 500000, leftover: 250000 + 250142, icon: IconPerfume },
    { title: "Transport", total: 300000, leftover: 150000 + 42052, icon: IconTir },
    { title: "Others", total: 932138, leftover: 932138, icon: IconFilter },
]

function formatRupiah(v: number) {
    return `Rp ${v.toLocaleString("id-ID")}`
}

export default function Page() {
    return (
        <>
            <SiteHeader title="Budget" />
            <section className="p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="col-span-3 flex items-center justify-between rounded-xl border bg-card px-4 py-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <span className="inline-flex size-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <IconCalendarDollar className="size-4" />
                            </span>
                            <div>
                                <p className="text-sm font-medium">Monthly Budget</p>
                                <p className="text-xs text-muted-foreground">March 2026</p>
                            </div>
                        </div>
                        <p className="text-sm font-bold tabular-nums text-foreground">
                            Rp {budgets.reduce((total, b) => total + b.leftover, 0).toLocaleString("id-ID")}
                        </p>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                        {budgets.map((b) => {
                            const leftover = Math.max(0, b.leftover)
                            const used = Math.max(0, b.total - leftover)
                            const remainingPct = b.total > 0 ? Math.round((leftover / b.total) * 100) : 0
                                const Icon = b.icon
                                const progressColor =
                                    remainingPct >= 66
                                        ? "bg-emerald-500 dark:bg-emerald-400"
                                        : remainingPct >= 34
                                        ? "bg-amber-400 dark:bg-amber-500"
                                        : "bg-rose-500 dark:bg-rose-400"

                                const progressWidth = Math.min(remainingPct, 100)

                            return (
                                <Card key={b.title} className="gap-2">
                                    <CardHeader className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/10">
                                                <Icon size={20} className="text-emerald-400" />
                                            </span>
                                            <CardTitle>{b.title}</CardTitle>
                                        </div>
                                        <CardAction className="text-sm font-bold tabular-nums">{formatRupiah(leftover)}</CardAction>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mt-2 space-y-2">
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>Remaining</span>
                                                <span>{remainingPct}%</span>
                                            </div>
                                                <div className="h-1 w-full rounded-full bg-muted/30">
                                                    <div
                                                        className={`h-1 rounded-full transition-all ${progressColor}`}
                                                        style={{ width: `${progressWidth}%` }}
                                                    />
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>Used: {formatRupiah(used)}</span>
                                                <span>Total: {formatRupiah(b.total)}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </section>
        </>
    )
}
