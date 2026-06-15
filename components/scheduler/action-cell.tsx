import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { schedulerService } from "@/services/scheduler-service"
import { toast } from "sonner"
import { Scheduler } from "@/types/scheduler-type"
import { Button } from "../ui/button"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { DeactivateSchedulerDialog } from "./deactivate-scheduler-dialog"

export const ActionCell = ({ scheduler }: { scheduler: Scheduler }) => {
    const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
    const queryClient = useQueryClient();
    
    const deactivateMutation = useMutation({
        mutationFn: async () => await schedulerService.deactivate(scheduler.id),
        onSuccess: () => {
            toast.success("Success", {
                description: "Scheduler deactivated.",
                duration: 3000,
            });
            queryClient.invalidateQueries({ queryKey: ["schedulers"] });
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
                        onClick={() => navigator.clipboard.writeText(scheduler.id)}
                    >
                        Copy payment ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        onSelect={() => {
                            setTimeout(() => {
                                setShowDeactivateDialog(true);
                            }, 100);
                        }}
                        disabled={scheduler.status === "Inactive" || deactivateMutation.isPending}
                    >
                        Deactivate
                    </DropdownMenuItem>
                    <DropdownMenuItem>View payment details</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DeactivateSchedulerDialog 
                open={showDeactivateDialog}
                onOpenChange={setShowDeactivateDialog}
                schedulerName={scheduler.name}
                onConfirm={() => deactivateMutation.mutate()}
                isPending={deactivateMutation.isPending}
            />
        </div>
    )
}
