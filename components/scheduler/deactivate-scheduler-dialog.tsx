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

interface DeactivateSchedulerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    schedulerName: string;
    onConfirm: () => void;
    isPending: boolean;
}

export const DeactivateSchedulerDialog = ({
    open,
    onOpenChange,
    schedulerName,
    onConfirm,
    isPending
}: DeactivateSchedulerDialogProps) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Deactivate Scheduler</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to deactivate &quot;{schedulerName}&quot;? It will no longer run automatically.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={onConfirm}
                        disabled={isPending}
                        className="bg-rose-500 hover:bg-rose-600 text-white"
                    >
                        {isPending ? "Deactivating..." : "Deactivate"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
