"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { createClient } from "@/lib/supabase/client"

type TxItem = { id: number | string; amount: number; budget_id?: string | null; wallet_id?: string | null }

export function DeleteTransactionDialog({ tx, onDeleted, onClose }: { tx?: TxItem | null; onDeleted?: () => void; onClose?: () => void }) {
    const supabase = createClient()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (tx) setOpen(true)
    }, [tx])

    async function handleDelete() {
        if (!tx) return
        setLoading(true)
        try {
            // fetch transaction details to revert budget/wallet changes
            const { data: trData, error: trErr } = await supabase.from("transactions").select("id, amount, budget_id, wallet_id").eq("id", tx.id).single()
            if (trErr) throw trErr

            const amount = trData?.amount ?? 0
            const budgetId = trData?.budget_id ?? null
            const walletId = trData?.wallet_id ?? null

            // revert budget leftover (increase by amount)
            if (budgetId) {
                try {
                    const { data: bData, error: bErr } = await supabase.from("budgets").select("leftover").eq("id", budgetId).single()
                    if (!bErr) {
                        const currentLeftover = bData?.leftover ?? 0
                        const newLeftover = currentLeftover + amount
                        await supabase.from("budgets").update({ leftover: newLeftover }).eq("id", budgetId)
                    }
                } catch (err) {
                    toast.error("Failed", { description: err instanceof Error ? err.message : "Unexpected error." })
                }
            }

            // revert wallet balance (increase by amount)
            if (walletId) {
                try {
                    const { data: wData, error: wErr } = await supabase.from("wallets").select("balance").eq("id", walletId).single()
                    if (!wErr) {
                        const currentBalance = wData?.balance ?? 0
                        const newBalance = currentBalance + amount
                        await supabase.from("wallets").update({ balance: newBalance }).eq("id", walletId)
                    }
                } catch (err) {
                    toast.error("Failed", { description: err instanceof Error ? err.message : "Unexpected error." })
                }
            }

            const { error: delErr } = await supabase.from("transactions").delete().eq("id", tx.id)
            if (delErr) {
                toast.error("Failed", { description: delErr.message })
                return
            }

            toast.success("Deleted", { description: "Transaction deleted." })
            setOpen(false)
            router.refresh()
            onDeleted?.()
        } catch (err) {
            toast.error("Failed", { description: err instanceof Error ? err.message : "Unexpected error." })
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <div />
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                </AlertDialogHeader>

                <p className="text-sm text-muted-foreground">Are you sure you want to delete this transaction? This action cannot be undone.</p>

                <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer" onClick={() => { setOpen(false); onClose?.(); }}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button variant="destructive" onClick={handleDelete} disabled={loading} className="cursor-pointer bg-rose-500! text-white">
                            {loading ? "Deleting..." : "Delete"}
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
