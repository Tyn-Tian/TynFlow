import { ChartPortfolio } from "@/components/chart-portfolio"
import { SiteHeader } from "@/components/site-header"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IconEaseInOut, IconShield } from "@tabler/icons-react"

const lowRiskPortfolios = [
    { title: "RD Pasar Uang", desc: "Low risk investment", target: 15, amount: 21713838 + 23843734, icon: IconShield },
    { title: "RD Pendapatan Tetap", desc: "Low risk investment", target: 40, amount: 39518052, icon: IconShield },
    { title: "RDN", desc: "Low risk investment", target: 3, amount: 3238191, icon: IconShield },
    { title: "Emas", desc: "Low risk investment", target: 20, amount: 27794340, icon: IconShield },
    { title: "Saham", desc: "High risk investment", target: 15, amount: 22853100, icon: IconEaseInOut },
    { title: "RD Campuran", desc: "High risk investment", target: 5, amount: 4894837, icon: IconEaseInOut },
    { title: "Bitcoin", desc: "High risk investment", target: 2, amount: 1513939, icon: IconEaseInOut },
]

function formatRupiah(v: number) {
    return `Rp ${v.toLocaleString("id-ID")}`
}

export default function Page() {
    const totalPortfolio = 145370031;

    return (
        <>
            <SiteHeader title="Portfolio" />
            <section className="p-6">
                <ChartPortfolio />

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {lowRiskPortfolios.map((b) => {
                        const amount = Math.max(0, b.amount)

                        const allocationPct = totalPortfolio > 0 ? Math.round(totalPortfolio * (b.target / 100)) : 0
                        const actualPct = allocationPct > 0 ? Math.round((amount / allocationPct) * 100) : 0

                        const Icon = b.icon

                        const barPct = Math.min(actualPct, 100)

                        const progressColor =
                            actualPct >= 66
                                ? "bg-emerald-500 dark:bg-emerald-400"
                                : actualPct >= 34
                                    ? "bg-amber-400 dark:bg-amber-500"
                                    : "bg-rose-500 dark:bg-rose-400"

                        return (
                            <Card key={b.title} className="gap-2">
                                <CardHeader className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/10">
                                            <Icon size={20} className="text-emerald-400" />
                                        </span>
                                        <div>
                                            <CardTitle>{b.title}</CardTitle>
                                            <CardDescription>{b.desc}</CardDescription>
                                        </div>
                                    </div>
                                    <CardAction className="text-sm font-bold tabular-nums">{formatRupiah(amount)}</CardAction>
                                </CardHeader>
                                <CardContent>
                                    <div className="mt-2 space-y-2">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>Allocation</span>
                                            <span>{actualPct}%</span>
                                        </div>
                                        <div className="h-1 w-full rounded-full bg-muted/30">
                                            <div
                                                className={`h-1 rounded-full transition-all ${progressColor}`}
                                                style={{ width: `${barPct}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>Target: {formatRupiah(allocationPct)}</span>
                                            <span>Portfolio: {formatRupiah(totalPortfolio)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </section>
        </>
    )
}
