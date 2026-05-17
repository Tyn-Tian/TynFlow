"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { IconPencil } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Wallet, WalletDto } from "@/types/wallet-type";
import { walletService } from "@/services/wallet-service";

const walletTypes = ["Bank", "Bank Digital", "E-Wallet", "Cash"] as const;

const formSchema = z.object({
  name: z.string().min(3, "Name is required"),
  type: z.enum(walletTypes, {
    message: "Type is required",
  }),
  balance: z.number().int().min(0, "Balance must be at least 0"),
});

type FormValues = z.infer<typeof formSchema>;

export function EditWalletDialog({
  wallet,
  onSuccess,
}: {
  wallet: Wallet;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: wallet.name,
      type: wallet.type as FormValues["type"],
      balance: wallet.balance,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: wallet.name,
        type: wallet.type as FormValues["type"],
        balance: wallet.balance,
      });
    }
  }, [open, wallet, form]);

  const mutation = useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: WalletDto }) =>
      await walletService.edit(id, dto),
    onSuccess: async () => {
      toast.success("Success", {
        description: "Wallet has been updated.",
        duration: 3000,
      });
      setOpen(false);
      onSuccess?.();
      queryClient.invalidateQueries({
        queryKey: ["wallets"],
      });
    },
    onError: (err: Error | unknown) => {
      toast.error("Failed", {
        description: err instanceof Error ? err.message : "Unexpected error.",
        duration: 3000,
      });
    },
  });

  async function onSubmit(values: FormValues) {
    if (!wallet.id) return;
    mutation.mutate({
      id: wallet.id,
      dto: {
        name: values.name,
        type: values.type,
        balance: values.balance,
      },
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        className="cursor-pointer"
        onClick={(event) => {
          event.stopPropagation();
          if (wallet.id) setOpen(true);
        }}
        disabled={!wallet.id}
      >
        <IconPencil />
        Edit
      </Button>
      <AlertDialogContent onClick={(event) => event.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Wallet</AlertDialogTitle>
          <AlertDialogDescription>
            Update your wallet details.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`wallet-name-${wallet.id ?? "temp"}`}>
                    Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`wallet-name-${wallet.id ?? "temp"}`}
                    placeholder="Example: BCA"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Type</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank">Bank</SelectItem>
                      <SelectItem value="Bank Digital">Bank Digital</SelectItem>
                      <SelectItem value="E-Wallet">E-Wallet</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="balance"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`wallet-balance-${wallet.id ?? "temp"}`}>
                    Balance
                  </FieldLabel>
                  <Input
                    value={
                      field.value !== undefined && field.value !== null
                        ? field.value.toLocaleString("id-ID")
                        : ""
                    }
                    id={`wallet-balance-${wallet.id ?? "temp"}`}
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    aria-invalid={fieldState.invalid}
                    required
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    onChange={(event) =>
                      field.onChange(
                        Number(event.target.value.replace(/\D/g, "")),
                      )
                    }
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <AlertDialogFooter>
              <AlertDialogCancel type="button" className="cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="cursor-pointer"
              >
                {mutation.isPending ? "Saving..." : "Save"}
              </Button>
            </AlertDialogFooter>
          </FieldGroup>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
