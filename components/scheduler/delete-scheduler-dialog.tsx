import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../ui/alert-dialog"

interface DeleteSchedulerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    schedulerName: string;
    onConfirm: () => void;
    isPending: boolean;
}

export const DeleteSchedulerDialog = ({
    open,
    onOpenChange,
    schedulerName,
    onConfirm,
    isPending,
}: DeleteSchedulerDialogProps) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Scheduler</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete <b>{schedulerName}</b>? 
                        This action cannot be undone and will permanently remove this scheduler.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isPending}
                        className="bg-rose-500 hover:bg-rose-600 text-white"
                    >
                        {isPending ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
