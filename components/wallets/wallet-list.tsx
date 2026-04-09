"use client"

import { useEffect, useState } from "react"
import { IconBuildingBank, IconCash, IconDeviceMobile, IconWallet, IconLoader, IconPigMoney } from "@tabler/icons-react"

import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { EditWalletDialog } from "@/components/wallets/edit-wallet-dialog"
import { DeleteWalletDialog } from "@/components/wallets/delete-wallet-dialog"
import { getWalletsAction } from "@/actions/wallet-actions"

type WalletItem = {
    id?: string | null
    name: string
    type: string
    balance: number
}

const iconByType = {
    Bank: IconBuildingBank,
    "Bank Digital": IconDeviceMobile,
    "E-Wallet": IconWallet,
    Cash: IconCash,
} as const

export function WalletList() {
    const [openId, setOpenId] = useState<string | null>(null)
    const [wallets, setWallets] = useState<WalletItem[] | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchWallets = async () => {
        setLoading(true)
        try {
            const data = await getWalletsAction()
            setWallets(data as WalletItem[])
        } catch (err) {
            console.error(err)
            setWallets([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let mounted = true
        void (async () => {
            if (!mounted) return
            await fetchWallets()
        })()

        const handler = () => void fetchWallets()
        window.addEventListener("wallets:changed", handler)

        return () => {
            mounted = false
            window.removeEventListener("wallets:changed", handler)
        }
    }, [])

    const monthYear = new Date().toLocaleString("en-US", { month: "long", year: "numeric" })

    if (loading) return <div className="flex items-center justify-center"><IconLoader className="animate-spin" /></div>
    if (!wallets || wallets.length === 0) return <div className="text-sm text-center text-muted-foreground">No wallets yet.</div>

    return (
        <>
            <div className="col-span-3 flex items-center justify-between rounded-xl border bg-card px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="inline-flex size-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <IconPigMoney className="size-4" />
                    </span>
                    <div>
                        <p className="text-sm font-medium">
                            Balance & Savings
                        </p>
                        <p className="text-xs text-muted-foreground">{monthYear}</p>
                    </div>
                </div>
                <p className="text-sm font-bold tabular-nums">
                    Rp {wallets.reduce((total, wallet) => total + wallet.balance, 0).toLocaleString("id-ID")}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {wallets.map((wallet) => {
                    const Icon = iconByType[wallet.type as keyof typeof iconByType] ?? IconWallet
                    const key = wallet.id ?? wallet.name
                    const isOpen = openId === key

                    return (
                        <Card
                            key={key}
                            className="@container/card cursor-pointer transition-shadow hover:shadow-md gap-4 self-start py-4"
                            onClick={() => setOpenId(isOpen ? null : key)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault()
                                    setOpenId(isOpen ? null : key)
                                }
                            }}
                        >
                            <CardHeader className="gap-0 flex items-center justify-between px-4">
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/10">
                                        <Icon size={20} className="text-emerald-400" />
                                    </span>
                                    <div className="flex flex-col">
                                        <CardTitle>{wallet.name}</CardTitle>
                                        <CardDescription>{wallet.type}</CardDescription>
                                    </div>
                                </div>
                                <CardAction className="text-sm font-bold tabular-nums self-center">
                                    Rp {wallet.balance.toLocaleString("id-ID")}
                                </CardAction>
                            </CardHeader>

                            {isOpen && (
                                <CardContent className="px-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <EditWalletDialog
                                            wallet={{
                                                id: wallet.id,
                                                name: wallet.name,
                                                type: wallet.type,
                                                balance: wallet.balance,
                                            }}
                                            onSuccess={() => setOpenId(null)}
                                        />
                                        <DeleteWalletDialog walletId={wallet.id} />
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