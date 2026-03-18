"use client"

import React, { useEffect, useState } from "react"
import { IconLoader, IconTarget } from "@tabler/icons-react"

import {
    Card,
    CardAction,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { formatRupiah } from "@/lib/utils"
import { EditGoalDialog } from "./edit-goal-dialog"
import { DeleteGoalDialog } from "./delete-goal-dialog"

type GoalItem = {
    id?: string | null
    name: string
    target: number
    saved: number
}

export function GoalList() {
    const supabase = createClient()
    const [openId, setOpenId] = useState<string | null>(null)
    const [goals, setGoals] = useState<GoalItem[] | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchGoals = async () => {
        setLoading(true)
        try {
            const { data: userData } = await supabase.auth.getUser()
            const user = userData?.user
            if (!user) {
                setGoals([])
                return
            }

            const { data, error } = await supabase
                .from("goals")
                .select("id, name, target, saved")
                .eq("user_id", user.id)
                .order("name", { ascending: true })

            if (error) throw error
            setGoals((data ?? []) as GoalItem[])
        } catch (err) {
            console.error(err)
            setGoals([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let mounted = true
        void (async () => {
            if (!mounted) return
            await fetchGoals()
        })()

        const handler = () => {
            void fetchGoals()
        }
        window.addEventListener("goals:changed", handler)

        return () => {
            mounted = false
            window.removeEventListener("goals:changed", handler)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supabase])

    if (loading) return <div className="flex items-center justify-center"><IconLoader className="animate-spin" /></div>
    if (!goals || goals.length === 0) return <div className="text-sm text-center text-muted-foreground">No goals yet.</div>

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {goals.map((g) => {
                const saved = Math.max(0, g.saved ?? 0)
                const progressPct = g.target > 0 ? Math.round((saved / g.target) * 100) : 0
                const progressColor =
                    progressPct >= 66
                        ? "bg-emerald-500 dark:bg-emerald-400"
                        : progressPct >= 34
                            ? "bg-amber-400 dark:bg-amber-500"
                            : "bg-rose-500 dark:bg-rose-400"
                const progressWidth = Math.min(progressPct, 100)
                const key = g.id ?? g.name
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
                                    <IconTarget size={20} className="text-emerald-400" />
                                </span>
                                <CardTitle>{g.name}</CardTitle>
                            </div>
                            <CardAction className="text-sm font-bold tabular-nums self-center">{formatRupiah(saved)}</CardAction>
                        </CardHeader>
                        <CardContent>
                            <div className="my-2 space-y-2">
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

                        {isOpen && (
                            <CardContent>
                                <div className="flex items-center justify-end gap-2">
                                    <EditGoalDialog
                                        goal={{ id: g.id, name: g.name, target: g.target, saved: g.saved }}
                                        onSuccess={() => setOpenId(null)}
                                    />
                                    <DeleteGoalDialog goalId={g.id} />
                                </div>
                            </CardContent>
                        )}
                    </Card>
                )
            })}
        </div>
    )
}
