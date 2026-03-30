"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
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

type DeletePortfolioDialogProps = {
    portfolioId?: string | null
}

export function DeletePortfolioDialog({ portfolioId }: DeletePortfolioDialogProps) {
    const supabase = createClient()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    async function handleDelete() {
        if (!portfolioId) return

        setDeleting(true)
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                toast.error("Failed", {
                    description: "Please login to delete a portfolio.",
                    duration: 3000,
                })
                return
            }

            const { error } = await supabase
                .from("portfolios")
                .delete()
                .eq("id", portfolioId)
                .eq("user_id", user.id)

            if (error) {
                toast.error("Failed", {
                    description: error.message,
                    duration: 3000,
                })
                return
            }

            toast.success("Deleted", {
                description: "Portfolio has been deleted.",
                duration: 3000,
            })
            setOpen(false)
            router.refresh()
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("portfolios:changed"))
            }
        } catch (error) {
            toast.error("Failed", {
                description: error instanceof Error ? error.message : "Unexpected error.",
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
                    if (portfolioId) setOpen(true)
                }}
                disabled={!portfolioId}
            >
                <IconTrash />
                Delete
            </Button>
            <AlertDialogContent onClick={(event) => event.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete portfolio?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the portfolio.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel type="button" className="cursor-pointer">
                        Cancel
                    </AlertDialogCancel>
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