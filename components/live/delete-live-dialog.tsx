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
import { liveApi } from "@/lib/api/live-api";

type DeleteLiveDialogProps = {
  liveId?: string | null;
};

export function DeleteLiveDialog({ liveId }: DeleteLiveDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: async (id: string) => await liveApi.delete(id),
    onSuccess: () => {
      toast.success("Deleted", {
        description: "Live has been deleted.",
        duration: 3000,
      });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["lives"] });
    },
    onError: (error) => {
      toast.error("Failed", {
        description:
          error instanceof Error ? error.message : "Unexpected error.",
        duration: 3000,
      });
    },
  });

  async function handleDelete() {
    if (!liveId) return;
    mutation.mutate(liveId);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        variant="destructive"
        className="cursor-pointer bg-rose-500!"
        onClick={(event) => {
          event.stopPropagation();
          if (liveId) setOpen(true);
        }}
        disabled={!liveId}
      >
        <IconTrash />
        Delete
      </Button>
      <AlertDialogContent
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Delete live?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the live
            data.
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
