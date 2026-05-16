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
import { Budget, BudgetDto } from "@/types/budget-type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { budgetService } from "@/services/budget-service";

const formSchema = z
  .object({
    name: z.string().min(3, "Name is required"),
    total: z.number().int().min(0, "Total must be at least 0"),
    leftover: z.number().int().min(0, "Leftover must be at least 0"),
  })
  .refine((data) => data.leftover <= data.total, {
    message: "Leftover cannot be greater than total",
    path: ["leftover"],
  });

type FormValues = z.infer<typeof formSchema>;

export function EditBudgetDialog({
  budget,
  onSuccess,
}: {
  budget: Budget;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: budget.name,
      total: budget.total,
      leftover: budget.leftover ?? budget.total,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: budget.name,
        total: budget.total,
        leftover: budget.leftover ?? budget.total,
      });
    }
  }, [open, budget, form]);

  const mutation = useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: BudgetDto }) =>
      await budgetService.edit(id, dto),
    onSuccess: () => {
      toast.success("Success", {
        description: "Budget has been updated.",
        duration: 3000,
      });
      setOpen(false);
      onSuccess?.();
      queryClient.invalidateQueries({
        queryKey: ["budgets"],
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
    if (!budget.id) return;
    mutation.mutate({
      id: budget.id,
      dto: values,
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        className="cursor-pointer"
        onClick={(event) => {
          event.stopPropagation();
          if (budget.id) setOpen(true);
        }}
        disabled={!budget.id}
      >
        <IconPencil />
        Edit
      </Button>
      <AlertDialogContent onClick={(event) => event.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Budget</AlertDialogTitle>
          <AlertDialogDescription>
            Update your budget details.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`budget-name-${budget.id ?? "temp"}`}>
                    Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`budget-name-${budget.id ?? "temp"}`}
                    placeholder="Example: Food & Drink"
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
              name="total"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`budget-total-${budget.id ?? "temp"}`}>
                    Total
                  </FieldLabel>
                  <Input
                    value={
                      field.value !== undefined && field.value !== null
                        ? field.value.toLocaleString("id-ID")
                        : ""
                    }
                    id={`budget-total-${budget.id ?? "temp"}`}
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

            <Controller
              name="leftover"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor={`budget-leftover-${budget.id ?? "temp"}`}
                  >
                    Leftover
                  </FieldLabel>
                  <Input
                    value={
                      field.value !== undefined && field.value !== null
                        ? field.value.toLocaleString("id-ID")
                        : ""
                    }
                    id={`budget-leftover-${budget.id ?? "temp"}`}
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
