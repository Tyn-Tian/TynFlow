"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { IconTrash } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { removeBudgetAction } from "@/actions/budget-actions"

export function DeleteBudgetDialog({ budgetId }: { budgetId?: string | null }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    async function handleDelete() {
        if (!budgetId) return

        setDeleting(true)
        try {
            await removeBudgetAction(budgetId)

            toast.success("Deleted", {
                description: "Budget has been deleted.",
                duration: 3000,
            })
            setOpen(false)
            router.refresh()
            if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("budgets:changed"))
        } catch (err: Error | unknown) {
            toast.error("Failed", {
                description: err instanceof Error ? err.message : "Unexpected error.",
                duration: 3000,
            })
        } finally {
            setDeleting(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <Button
                variant="destructive"
                className="cursor-pointer bg-rose-500!"
                onClick={(event) => {
                    event.stopPropagation()
                    if (budgetId) setOpen(true)
                }}
                disabled={!budgetId}
            >
                <IconTrash />
                Delete
            </Button>
            <AlertDialogContent onClick={(event) => event.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete budget?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the budget.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel type="button" className="cursor-pointer">Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button
                            variant="destructive"
                            className="cursor-pointer bg-rose-500! text-white"
                            onClick={(event) => {
                                event.stopPropagation()
                                void handleDelete()
                            }}
                            disabled={deleting}
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
