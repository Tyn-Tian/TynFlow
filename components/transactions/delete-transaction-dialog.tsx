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
import { removeTransactionAction } from "@/actions/transaction-actions"

type TxItem = { id: number | string; amount: number; budget_id?: string | null; wallet_id?: string | null; transfer_id?: string | null }

export function DeleteTransactionDialog({ tx, onDeleted, onClose }: { tx?: TxItem | null; onDeleted?: () => void; onClose?: () => void }) {
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
            await removeTransactionAction(tx.id)

            toast.success("Deleted", { description: "Transaction deleted." })
            setOpen(false)
            router.refresh()
            if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("transactions:changed"))
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
