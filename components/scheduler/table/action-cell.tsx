import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { schedulerApi } from "@/lib/api/scheduler-api"
import { toast } from "sonner"
import { Scheduler } from "@/types/scheduler-type"
import { Button } from "../../ui/button"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../ui/dropdown-menu"
import { ToggleStatusSchedulerDialog } from "../toggle-status-scheduler-dialog"
import { DeleteSchedulerDialog } from "../delete-scheduler-dialog"
import { EditSchedulerDialog } from "../edit-scheduler-dialog"

export const ActionCell = ({ scheduler }: { scheduler: Scheduler }) => {
    const [showToggleDialog, setShowToggleDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const queryClient = useQueryClient();
    
    const deactivateMutation = useMutation({
        mutationFn: async () => await schedulerApi.deactivate(scheduler.id),
        onSuccess: () => {
            toast.success("Success", {
                description: "Scheduler deactivated.",
                duration: 3000,
            });
            queryClient.invalidateQueries({ queryKey: ["schedulers"] });
            setShowToggleDialog(false);
        },
        onError: (err: Error | unknown) => {
            toast.error("Failed", {
                description: err instanceof Error ? err.message : "Unexpected error.",
                duration: 3000,
            });
        }
    });

    const activateMutation = useMutation({
        mutationFn: async () => await schedulerApi.activate(scheduler.id),
        onSuccess: () => {
            toast.success("Success", {
                description: "Scheduler activated.",
                duration: 3000,
            });
            queryClient.invalidateQueries({ queryKey: ["schedulers"] });
            setShowToggleDialog(false);
        },
        onError: (err: Error | unknown) => {
            toast.error("Failed", {
                description: err instanceof Error ? err.message : "Unexpected error.",
                duration: 3000,
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async () => await schedulerApi.delete(scheduler.id),
        onSuccess: () => {
            toast.success("Success", {
                description: "Scheduler deleted.",
                duration: 3000,
            });
            queryClient.invalidateQueries({ queryKey: ["schedulers"] });
            setShowDeleteDialog(false);
        },
        onError: (err: Error | unknown) => {
            toast.error("Failed", {
                description: err instanceof Error ? err.message : "Unexpected error.",
                duration: 3000,
            });
        }
    });

    return (
        <div className="flex justify-end">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    
                    <DropdownMenuItem 
                        onSelect={() => {
                            setTimeout(() => {
                                setShowEditDialog(true);
                            }, 100);
                        }}
                    >
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        onSelect={() => {
                            setTimeout(() => {
                                setShowToggleDialog(true);
                            }, 100);
                        }}
                        disabled={deactivateMutation.isPending || activateMutation.isPending || deleteMutation.isPending}
                    >
                        {scheduler.status === "Inactive" ? "Activate" : "Deactivate"}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        onSelect={() => {
                            setTimeout(() => {
                                setShowDeleteDialog(true);
                            }, 100);
                        }}
                        className="text-rose-600 focus:text-rose-600"
                        disabled={deleteMutation.isPending}
                    >
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ToggleStatusSchedulerDialog 
                open={showToggleDialog}
                onOpenChange={setShowToggleDialog}
                schedulerName={scheduler.name}
                onConfirm={() => {
                    if (scheduler.status === "Inactive") {
                        activateMutation.mutate();
                    } else {
                        deactivateMutation.mutate();
                    }
                }}
                isPending={deactivateMutation.isPending || activateMutation.isPending}
                currentStatus={scheduler.status}
            />

            <DeleteSchedulerDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                schedulerName={scheduler.name}
                onConfirm={() => deleteMutation.mutate()}
                isPending={deleteMutation.isPending}
            />

            {showEditDialog && (
                <EditSchedulerDialog
                    open={showEditDialog}
                    onOpenChange={setShowEditDialog}
                    scheduler={scheduler}
                />
            )}
        </div>
    )
}
