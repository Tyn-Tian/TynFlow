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

interface ToggleStatusSchedulerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    schedulerName: string;
    onConfirm: () => void;
    isPending: boolean;
    currentStatus: string;
}

export const ToggleStatusSchedulerDialog = ({
    open,
    onOpenChange,
    schedulerName,
    onConfirm,
    isPending,
    currentStatus
}: ToggleStatusSchedulerDialogProps) => {
    const isActivating = currentStatus === "Inactive";

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{isActivating ? "Activate" : "Deactivate"} Scheduler</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to {isActivating ? "activate" : "deactivate"} <b>{schedulerName}</b>?
                        {isActivating ? " It will resume running automatically." : " It will no longer run automatically."}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isPending}
                        className={isActivating ? "" : "bg-rose-500 hover:bg-rose-600 text-white"}
                    >
                        {isPending ? (isActivating ? "Activating..." : "Deactivating...") : (isActivating ? "Activate" : "Deactivate")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
