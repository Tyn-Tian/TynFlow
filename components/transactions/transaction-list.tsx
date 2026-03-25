"use client"

import { useEffect, useState } from "react"
import { IconWallet, IconLoader } from "@tabler/icons-react"
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EditTransactionDialog } from "./edit-transaction-dialog"
import { createClient } from "@/lib/supabase/client"

type TxItem = {
    id: number | string
    name: string
    date: string
    amount: number
    budgetName?: string | null
    walletName?: string | null
    budget_id?: string | null
    wallet_id?: string | null
    transfer_id?: string | null
    transferName?: string | null
    type: "Income" | "Expense" | "Transfer"
}

export function TransactionList() {
    const supabase = createClient()
    const [editTx, setEditTx] = useState<TxItem | null>(null)
    const [transactions, setTransactions] = useState<TxItem[] | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchTransactions = async () => {
        setLoading(true)
        try {
            const { data: userData } = await supabase.auth.getUser()
            const user = userData?.user
            if (!user) {
                setTransactions([])
                return
            }

            const { data: txData, error: txError } = await supabase
                .from("transactions")
                .select("id, name, date, amount, type, budget_id, wallet_id, transfer_id")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })

            if (txError) throw txError

            type RawTx = { id: string; name: string; date: string; amount: number; budget_id?: string | null; wallet_id?: string | null; transfer_id?: string | null; type: string }
            const rows = (txData ?? []) as RawTx[]

            const walletIds = Array.from(new Set(rows.flatMap((r) => [r.wallet_id, r.transfer_id].filter(Boolean) as string[])))
            let walletMap: Record<string, string> = {}
            if (walletIds.length) {
                const { data: walletsData, error: walletsError } = await supabase
                    .from("wallets")
                    .select("id, name")
                    .in("id", walletIds)
                if (!walletsError && walletsData) walletMap = Object.fromEntries((walletsData as { id: string; name?: string }[]).map((w) => [w.id, w.name ?? ""]))
            }

            const budgetIds = Array.from(new Set(rows.map((r) => r.budget_id).filter(Boolean) as string[]))
            let budgetMap: Record<string, string> = {}
            if (budgetIds.length) {
                const { data: budgetsData, error: budgetsError } = await supabase
                    .from("budgets")
                    .select("id, name")
                    .in("id", budgetIds)
                if (!budgetsError && budgetsData) budgetMap = Object.fromEntries((budgetsData as { id: string; name?: string }[]).map((b) => [b.id, b.name ?? ""]))
            }

            const txs: TxItem[] = rows.map((t) => ({
                id: t.id,
                name: t.name,
                date: t.date,
                amount: t.amount,
                budgetName: t.budget_id ? budgetMap[t.budget_id] : undefined,
                walletName: t.wallet_id ? walletMap[t.wallet_id] : undefined,
                transferName: t.transfer_id ? walletMap[t.transfer_id] : undefined,
                budget_id: t.budget_id ?? undefined,
                wallet_id: t.wallet_id ?? undefined,
                transfer_id: t.transfer_id ?? undefined,
                type: t.type as "Income" | "Expense" | "Transfer",
            }))

            setTransactions(txs)
        } catch (err) {
            console.error(err)
            setTransactions([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let mounted = true
        void (async () => {
            if (!mounted) return
            await fetchTransactions()
        })()

        const handler = () => void fetchTransactions()
        window.addEventListener("transactions:changed", handler)

        return () => {
            mounted = false
            window.removeEventListener("transactions:changed", handler)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supabase])

    if (loading) return <div className="flex items-center justify-center"><IconLoader className="animate-spin" /></div>
    if (!transactions || transactions.length === 0) return <div className="text-sm text-center text-muted-foreground">No transactions yet.</div>

    const groups = transactions.reduce<Record<string, TxItem[]>>((acc, t) => {
        const d = new Date(t.date)
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
            d.getDate()
        ).padStart(2, "0")}`
            ; (acc[dateKey] ??= []).push(t)
        return acc
    }, {})

    const sortedDates = Object.keys(groups).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    const dailyTotals: Record<string, number> = Object.fromEntries(
        sortedDates.map((date) => [
            date,
            groups[date].reduce((acc, t) => {
                if (t.type === "Income") return acc + Math.abs(t.amount)
                if (t.type === "Expense") return acc - Math.abs(t.amount)
                return acc
            }, 0),
        ])
    )

    const getDailyTotalInfo = (date: string) => {
        const total = dailyTotals[date] ?? 0
        return {
            total,
            isPositive: total > 0,
            isNegative: total < 0,
            formatted: Math.abs(total).toLocaleString("id-ID"),
        }
    }

    return (
        <div>
            {sortedDates.map((date) => (
                <div key={date} className="mb-6">
                    <div className="flex justify-between items-center">
                        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                            {new Date(date).toLocaleDateString("id-ID", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </h3>
                        <p className={`text-xs font-semibold ${getDailyTotalInfo(date).isPositive ? "text-emerald-500" : getDailyTotalInfo(date).isNegative ? "text-rose-500" : "text-muted-foreground"}`}>
                            {getDailyTotalInfo(date).isPositive ? "+" : getDailyTotalInfo(date).isNegative ? "-" : ""} Rp {getDailyTotalInfo(date).formatted}
                        </p>
                    </div>
                    <div className="space-y-3">
                        {groups[date].map((tx) => (
                            <Card
                                key={tx.id}
                                className="@container/card cursor-pointer transition-shadow hover:shadow-md gap-4 self-start py-4"
                                onClick={() => setEditTx(tx)}
                            >
                                <CardHeader className="gap-0 flex items-center justify-between px-4">
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/10">
                                            <IconWallet size={20} className="text-emerald-400" />
                                        </span>
                                        <div className="flex flex-col">
                                            <CardTitle>{tx.name}</CardTitle>
                                            <CardDescription>
                                                {tx.type === "Income" ? (
                                                    tx.walletName ?? "-"
                                                ) : tx.type === "Expense" ? (
                                                    tx.budgetName ?? "-"
                                                ) : (
                                                    `${tx.walletName ?? "-"} → ${tx.transferName ?? "-"}`
                                                )}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <CardAction className="self-center text-sm font-bold tabular-nums">
                                        {tx.type === "Income" ? "+" : "-"} Rp {Math.abs(tx.amount).toLocaleString("id-ID")}
                                    </CardAction>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}

            {editTx && <EditTransactionDialog tx={editTx} onClose={() => setEditTx(null)} />}
        </div>
    )
}
