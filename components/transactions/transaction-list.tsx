"use client"

import { IconWallet } from "@tabler/icons-react"
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { EditTransactionDialog } from "./edit-transaction-dialog"

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

export function TransactionList({ transactions }: { transactions: TxItem[] }) {
    const [editTx, setEditTx] = useState<TxItem | null>(null)
    const groups = transactions.reduce<Record<string, TxItem[]>>((acc, t) => {
        const d = new Date(t.date)
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
            d.getDate()
        ).padStart(2, "0")}`
            ; (acc[dateKey] ??= []).push(t)
        return acc
    }, {})

    const sortedDates = Object.keys(groups).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    return (
        <div>
            {sortedDates.map((date) => (
                <div key={date} className="mb-6">
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                        {new Date(date).toLocaleDateString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </h3>
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
