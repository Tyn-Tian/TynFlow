import { SiteHeader } from "@/components/site-header"
import { formatRupiah } from "@/lib/utils"
import {
    Card,
    CardHeader,
    CardTitle,
    CardAction,
    CardContent,
    CardDescription,
} from "@/components/ui/card"
import {
    IconDeviceLaptop,
    IconShield,
    IconShoe,
    IconStereoGlasses,
    IconTarget,
} from "@tabler/icons-react"

const goals = [
    { title: "Emergency Fund", desc: "Portfolio - RD Pasar Uang", target: 22155134, saved: 45557572, icon: IconShield },
    { title: "Asics NYC", desc: "Portfolio - RD Pasar Uang", target: 2500000, saved: 0, icon: IconShoe },
    { title: "Macbook Air M4", desc: "Portfolio - RD Pasar Uang", target: 25000000, saved: 0, icon: IconDeviceLaptop },
    { title: "Glasses", desc: "Portfolio - RD Pasar Uang", target: 1000000, saved: 0, icon: IconStereoGlasses }
]

export default function Page() {
    return (
        <>
            <SiteHeader title="Goals" />
            <section className="p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="col-span-3 rounded-xl border bg-card px-4 py-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <span className="inline-flex size-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <IconTarget className="size-4" />
                            </span>
                            <div>
                                <p className="text-sm font-medium">Manage Goals</p>
                                <p className="text-xs text-muted-foreground">Set your financial targets</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                        {goals.map((g) => {
                            const saved = Math.max(0, g.saved)
                            const progressPct = g.target > 0 ? Math.round((saved / g.target) * 100) : 0
                            const Icon = g.icon
                            const progressColor =
                                progressPct >= 66
                                    ? "bg-emerald-500 dark:bg-emerald-400"
                                    : progressPct >= 34
                                        ? "bg-amber-400 dark:bg-amber-500"
                                        : "bg-rose-500 dark:bg-rose-400"

                            const progressWidth = Math.min(progressPct, 100)

                            return (
                                <Card key={g.title} className="gap-2">
                                    <CardHeader className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/10">
                                                <Icon size={20} className="text-emerald-400" />
                                            </span>
                                            <div>
                                                <CardTitle>{g.title}</CardTitle>
                                                <CardDescription>
                                                    {g.desc}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <CardAction className="text-sm font-bold tabular-nums">{formatRupiah(saved)}</CardAction>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mt-2 space-y-2">
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>Progress</span>
                                                <span>{progressPct}%</span>
                                            </div>
                                            <div className="h-1 w-full rounded-full bg-muted/30">
                                                <div
                                                    className={`h-1 rounded-full transition-all ${progressColor}`}
                                                    style={{ width: `${progressWidth}%` }}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>Saved: {formatRupiah(saved)}</span>
                                                <span>Target: {formatRupiah(g.target)}</span>
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
