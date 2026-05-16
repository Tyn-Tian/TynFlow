"use client";

import { useState } from "react";
import { toast } from "sonner";
import { IconTrash } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
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
import { walletRepository } from "@/repository/wallet-repository";

export function DeleteWalletDialog({ walletId }: { walletId?: string | null }) {
  const queryClient = useQueryClient()

  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: (id: string) => walletRepository.delete(id),
    onSuccess: () => {
      toast.success("Success", {
        description: "Wallet has been added.",
        duration: 3000,
      });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
    onError: (err: Error | unknown) => {
      toast.error("Failed", {
        description: err instanceof Error ? err.message : "Unexpected error.",
        duration: 3000,
      });
    },
  });

  async function handleDelete() {
    if (!walletId) return;
    mutation.mutate(walletId);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        variant="destructive"
        className="cursor-pointer bg-rose-500!"
        onClick={(event) => {
          event.stopPropagation();
          if (walletId) setOpen(true);
        }}
        disabled={!walletId}
      >
        <IconTrash />
        Delete
      </Button>
      <AlertDialogContent onClick={(event) => event.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete wallet?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            wallet.
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
                event.stopPropagation();
                void handleDelete();
              }}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
