"use client"

import { useState } from "react"
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
} from "@/components/ui/alert-dialog"
import { useDeleteJob } from "@/hooks/use-job"

export function DeleteJobDialog({ jobId, jobPosition, open, setOpen, onDeleted }: { 
    jobId?: number | string | null; 
    jobPosition?: string | null;
    open: boolean;
    setOpen: (open: boolean) => void;
    onDeleted?: () => void;
}) {
    const [loading, setLoading] = useState(false)
    const { mutateAsync: deleteJob } = useDeleteJob()

    async function handleDelete() {
        if (!jobId) return
        setLoading(true)
        try {
            await deleteJob(jobId.toString())
            toast.success("Deleted", { description: "Job entry deleted." })
            setOpen(false)
            onDeleted?.()
        } catch (err) {
            toast.error("Failed", { description: err instanceof Error ? err.message : "Unexpected error." })
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Job</AlertDialogTitle>
                </AlertDialogHeader>

                <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete the <strong>{jobPosition}</strong> position? This action cannot be undone.
                </p>

                <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer" onClick={() => setOpen(false)}>
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
