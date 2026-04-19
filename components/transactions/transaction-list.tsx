"use client"

import { useEffect, useState } from "react"
import { IconWallet, IconLoader, IconTrendingUp } from "@tabler/icons-react"
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EditTransactionDialog } from "./edit-transaction-dialog"
import { getTransactionsAction } from "@/actions/transaction-actions"

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
    portfolioName?: string | null
    portfolio_id?: string | null
    admin_fee?: number | null
    type: "Income" | "Expense" | "Transfer" | "Invest"
}

interface TransactionListProps {
    initialTransactions?: TxItem[]
}

export function TransactionList({ initialTransactions }: TransactionListProps) {
    const [editTx, setEditTx] = useState<TxItem | null>(null)
    const [transactions, setTransactions] = useState<TxItem[] | null>(initialTransactions ?? null)
    const [loading, setLoading] = useState(!initialTransactions)

    // Update state when initialTransactions changes
    useEffect(() => {
        if (initialTransactions) {
            setTransactions(initialTransactions)
            setLoading(false)
        }
    }, [initialTransactions])

    const fetchTransactions = async () => {
        setLoading(true)
        try {
            const txs = await getTransactionsAction()
            setTransactions(txs as TxItem[])
        } catch (err) {
            console.error(err)
            setTransactions([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let mounted = true
        if (!initialTransactions) {
            void (async () => {
                if (!mounted) return
                await fetchTransactions()
            })()
        }

        const handler = () => void fetchTransactions()
        window.addEventListener("transactions:changed", handler)

        return () => {
            mounted = false
            window.removeEventListener("transactions:changed", handler)
        }
    }, [initialTransactions])

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
                                        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-md ${tx.type === "Invest" ? "bg-blue-500/10" : "bg-emerald-500/10"}`}>
                                            {tx.type === "Invest" ? (
                                                <IconTrendingUp size={20} className="text-blue-400" />
                                            ) : (
                                                <IconWallet size={20} className="text-emerald-400" />
                                            )}
                                        </span>
                                        <div className="flex flex-col">
                                            <CardTitle>{tx.name}</CardTitle>
                                            <CardDescription>
                                                {tx.type === "Income" ? (
                                                    tx.walletName ?? "-"
                                                ) : tx.type === "Expense" ? (
                                                    tx.budgetName ?? "-"
                                                ) : tx.type === "Invest" ? (
                                                    `${tx.walletName ?? "-"} → ${tx.portfolioName ?? "-"}`
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
