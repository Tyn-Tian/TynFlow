"use client"

import { useState } from "react"
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
import { createClient } from "@/lib/supabase/client"

export function DeleteGoalDialog({ goalId }: { goalId?: string | null }) {
    const supabase = createClient()
    const [open, setOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    async function handleDelete() {
        if (!goalId) return

        setDeleting(true)
        try {
            const { error } = await supabase.from("goals").delete().eq("id", goalId)

            if (error) {
                toast.error("Failed", { description: error.message, duration: 3000 })
                return
            }

            toast.success("Deleted", { description: "Goal has been deleted.", duration: 3000 })
            setOpen(false)
            if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("goals:changed"))
        } catch (err: Error | unknown) {
            toast.error("Failed", { description: err instanceof Error ? err.message : "Unexpected error.", duration: 3000 })
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
                    if (goalId) setOpen(true)
                }}
                disabled={!goalId}
            >
                <IconTrash />
                Delete
            </Button>
            <AlertDialogContent onClick={(event) => event.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete goal?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the goal.
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
