"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Wishlist } from "@/types/wishlist-type";
import { wishlistApi } from "@/lib/api/wishlist-api";

interface DeleteWishlistDialogProps {
    wishlist: Wishlist | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DeleteWishlistDialog({
    wishlist,
    open,
    onOpenChange,
}: DeleteWishlistDialogProps) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (id: string) => await wishlistApi.delete(id),
        onSuccess: () => {
            toast.success("Success", {
                description: "Wishlist deleted successfully.",
                duration: 3000,
            });
            onOpenChange(false);
            queryClient.invalidateQueries({
                queryKey: ["wishlists"],
            });
        },
        onError: (err: Error | unknown) => {
            toast.error("Failed", {
                description: err instanceof Error ? err.message : "Unexpected error.",
                duration: 3000,
            });
        },
    });

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the wishlist
                        <b>{wishlist?.name}</b>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={mutation.isPending}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        disabled={mutation.isPending}
                        onClick={(e) => {
                            e.preventDefault();
                            if (wishlist) {
                                mutation.mutate(wishlist.id);
                            }
                        }}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    >
                        {mutation.isPending ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
