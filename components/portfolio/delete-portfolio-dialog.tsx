"use client"

import { useState } from "react"
import { IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"

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
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { portfolioApi } from "@/lib/api/portfolio-api"

type DeletePortfolioDialogProps = {
    portfolioId?: string | null
}

export function DeletePortfolioDialog({ portfolioId }: DeletePortfolioDialogProps) {
    const queryClient = useQueryClient()
    const [open, setOpen] = useState(false)

    const mutation = useMutation({
        mutationFn: async (id: string) => await portfolioApi.delete(id),
        onSuccess: () => {
            toast.success("Deleted", {
                description: "Portfolio has been deleted.",
                duration: 3000,
            })
            setOpen(false)
            queryClient.invalidateQueries({ queryKey: ["portfolios"] })
        },
        onError: (error) => {
            toast.error("Failed", {
                description: error instanceof Error ? error.message : "Unexpected error.",
                duration: 3000,
            })
        },
    })

    async function handleDelete() {
        if (!portfolioId) return
        mutation.mutate(portfolioId)
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
            <AlertDialogContent
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
            >
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
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? "Deleting..." : "Delete"}
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}