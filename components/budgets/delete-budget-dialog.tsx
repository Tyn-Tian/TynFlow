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
import { budgetService } from "@/services/budget-service";

export function DeleteBudgetDialog({ budgetId }: { budgetId?: string | null }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: async (id: string) => await budgetService.delete(id),
    onSuccess: () => {
      toast.success("Deleted", {
        description: "Budget has been deleted.",
        duration: 3000,
      });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["enriched-budgets"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (err: Error | unknown) => {
      toast.error("Failed", {
        description: err instanceof Error ? err.message : "Unexpected error.",
        duration: 3000,
      });
    },
  });

  async function handleDelete() {
    if (!budgetId) return;
    mutation.mutate(budgetId);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        variant="destructive"
        className="cursor-pointer bg-rose-500!"
        onClick={(event) => {
          event.stopPropagation();
          if (budgetId) setOpen(true);
        }}
        disabled={!budgetId}
      >
        <IconTrash />
        Delete
      </Button>
      <AlertDialogContent
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Delete budget?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            budget.
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
