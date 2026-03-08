"use client"

import { useState } from "react"
import { IconLockDollar } from "@tabler/icons-react"

import {
    Card,
    CardAction,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { EditBudgetDialog } from "@/components/budgets/edit-budget-dialog"
import { DeleteBudgetDialog } from "@/components/budgets/delete-budget-dialog"
import { formatRupiah } from "@/lib/utils"

type BudgetItem = {
    id?: string | null
    name: string
    total: number
    leftover: number
}

export function BudgetList({ budgets }: { budgets: BudgetItem[] }) {
    const [openId, setOpenId] = useState<string | null>(null)
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {budgets.map((b) => {
                const leftover = Math.max(0, b.leftover)
                const used = Math.max(0, b.total - leftover)
                const remainingPct = b.total > 0 ? Math.round((leftover / b.total) * 100) : 0

                const progressColor =
                    remainingPct >= 66
                        ? "bg-emerald-500 dark:bg-emerald-400"
                        : remainingPct >= 34
                            ? "bg-amber-400 dark:bg-amber-500"
                            : "bg-rose-500 dark:bg-rose-400"

                const progressWidth = Math.min(remainingPct, 100)

                const key = b.id ?? b.name
                const isOpen = openId === key

                return (
                    <Card
                        key={key}
                        className="@container/card cursor-pointer transition-shadow hover:shadow-md gap-2 self-start"
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
                        <CardHeader className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/10">
                                    <IconLockDollar size={20} className="text-emerald-400" />
                                </span>
                                <CardTitle>{b.name}</CardTitle>
                            </div>
                            <CardAction className="text-sm font-bold tabular-nums self-center">{formatRupiah(leftover)}</CardAction>
                        </CardHeader>
                        <CardContent>
                            <div className="my-2 space-y-2">
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

                        {isOpen && (
                            <CardContent>
                                <div className="flex items-center justify-end gap-2">
                                    <EditBudgetDialog
                                        budget={{ id: b.id, name: b.name, total: b.total, leftover: b.leftover }}
                                        onSuccess={() => setOpenId(null)}
                                    />
                                    <DeleteBudgetDialog budgetId={b.id} />
                                </div>
                            </CardContent>
                        )}
                    </Card>
                )
            })}
        </div>
    )
}
