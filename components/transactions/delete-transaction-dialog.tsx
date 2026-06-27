"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionService } from "@/services/transaction-service";

type TxItem = {
  id: number | string;
  amount: number;
  budget_id?: string | null;
  wallet_id?: string | null;
  transfer_id?: string | null;
};

export function DeleteTransactionDialog({
  tx,
  onDeleted,
  onClose,
}: {
  tx?: TxItem | null;
  onDeleted?: () => void;
  onClose?: () => void;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(!!tx);
  const [prevTx, setPrevTx] = useState(tx);

  if (tx !== prevTx) {
    setPrevTx(tx);
    if (tx) setOpen(!!tx);
  }

  const mutation = useMutation({
    mutationFn: async (id: string) => await transactionService.delete(id),
    onSuccess: () => {
      toast.success("Deleted", { description: "Transaction deleted." });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({
        queryKey: ["budgets"],
      });
      queryClient.invalidateQueries({
        queryKey: ["enriched-budgets"],
      });
      queryClient.invalidateQueries({
        queryKey: ["wallets"],
      });
      queryClient.invalidateQueries({
        queryKey: ["portfolios"],
      });
      onDeleted?.();
    },
    onError: (err: Error | unknown) => {
      toast.error("Failed", {
        description: err instanceof Error ? err.message : "Unexpected error.",
      });
    },
  });

  async function handleDelete() {
    if (!tx) return;
    mutation.mutate(tx.id as string);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <div />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
        </AlertDialogHeader>

        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete this transaction? This action cannot
          be undone.
        </p>

        <AlertDialogFooter>
          <AlertDialogCancel
            className="cursor-pointer"
            onClick={() => {
              setOpen(false);
              onClose?.();
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={mutation.isPending}
              className="cursor-pointer bg-rose-500! text-white"
            >
              {mutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
