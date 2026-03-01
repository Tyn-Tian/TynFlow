import { SiteHeader } from "@/components/site-header"
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IconBuildingBank, IconDeviceMobile, IconPigMoney, IconWallet } from "@tabler/icons-react"

const wallets = [
    {
        name: "Mandiri",
        type: "Bank",
        balance: 1506563,
        icon: IconBuildingBank
    },
    {
        name: "Jago",
        type: "Bank Digital",
        balance: 639092 + 126053 + 250142 + 932138,
        icon: IconDeviceMobile
    },
    {
        name: "GoPay",
        type: "E-Wallet",
        balance: 42052,
        icon: IconWallet
    },
]

export default function Page() {
    return (
        <>
            <SiteHeader title="Wallet" />
            <section className="p-6">
                <div className="mx-auto max-w-7xl">
                    <div className=" grid grid-cols-3 gap-4">
                        <div className="col-span-3 flex items-center justify-between rounded-xl border bg-card px-4 py-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <span className="inline-flex size-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <IconPigMoney className="size-4" />
                                </span>
                                <div>
                                    <p className="text-sm font-medium">
                                        Balance & Savings
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        March 2026
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm font-bold tabular-nums">
                                Rp {wallets.reduce((total, wallet) => total + wallet.balance, 0).toLocaleString("id-ID")}
                            </p>
                        </div>

                        {wallets.map((wallet) =>  (
                            <Card key={wallet.name} className="@container/card">
                                <CardHeader className="gap-0 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/10">
                                            <wallet.icon size={20} className="text-emerald-400" />
                                        </span>
                                        <div className="flex flex-col">
                                            <CardTitle>{wallet.name}</CardTitle>
                                            <CardDescription>{wallet.type}</CardDescription>
                                        </div>
                                    </div>
                                    <CardAction className="text-sm font-bold tabular-nums">
                                        Rp {wallet.balance.toLocaleString("id-ID")}
                                    </CardAction>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}
