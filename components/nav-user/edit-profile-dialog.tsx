"use client";

import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconUserCircle } from "@tabler/icons-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { AlertDialogDescription } from "@/components/ui/alert-dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { authService } from "@/services/auth-service";
import { UpdateProfileDto } from "@/types/auth-type";

const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;

const formSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    start_date: z.string().optional().or(z.literal("")),
    end_date: z.string().optional().or(z.literal("")),
  })
  .superRefine((val, ctx) => {
    const sd = val.start_date;
    const ed = val.end_date;
    if (sd && !datePattern.test(sd)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["start_date"],
        message: "Invalid format (DD/MM/YYYY)",
      });
    }
    if (ed && !datePattern.test(ed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end_date"],
        message: "Invalid format (DD/MM/YYYY)",
      });
    }
    if (sd && ed && datePattern.test(sd) && datePattern.test(ed)) {
      const [sdD, sdM, sdY] = sd.split("/").map(Number);
      const [edD, edM, edY] = ed.split("/").map(Number);
      const s = new Date(sdY, sdM - 1, sdD);
      const e = new Date(edY, edM - 1, edD);
      if (s > e) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["start_date"],
          message: "Must be before or equal to end date",
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["end_date"],
          message: "Must be after or equal to start date",
        });
      }
    }
  });

type FormValues = z.infer<typeof formSchema>;

export function EditProfileDialog({
  user,
}: {
  user: { name: string; email: string };
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name ?? "",
      start_date: "",
      end_date: "",
    },
  });

  const fmtDDMMYYYY = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => await authService.getProfile(),
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      let sdStr = "";
      let edStr = "";
      if (profile?.start_date) {
        const sd = new Date(profile.start_date);
        if (!isNaN(sd.getTime())) sdStr = fmtDDMMYYYY(sd);
      }
      if (profile?.end_date) {
        const ed = new Date(profile.end_date);
        if (!isNaN(ed.getTime())) edStr = fmtDDMMYYYY(ed);
      }
      form.reset({
        name: profile?.name ?? user.name ?? "",
        start_date: sdStr,
        end_date: edStr,
      });
    }
  }, [open, profile, form, user.name]);

  const mutation = useMutation({
    mutationFn: async (dto: UpdateProfileDto) =>
      await authService.updateProfile(dto),
    onSuccess: () => {
      toast.success("Success", {
        description: "Profile has been updated.",
        duration: 3000,
      });
      setOpen(false);
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      toast.error("Failed", {
        description:
          error instanceof Error ? error.message : "Unexpected error.",
        duration: 3000,
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    const toIso = (s?: string) => {
      if (!s) return null;
      const [d, m, y] = s.split("/").map(Number);
      const dt = new Date(Date.UTC(y, m - 1, d));
      return isNaN(dt.getTime()) ? null : dt.toISOString();
    };

    mutation.mutate({
      name: values.name,
      start_date: toIso(values.start_date),
      end_date: toIso(values.end_date),
    });
  };

  return (
    <>
      <DropdownMenuItem
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="cursor-pointer"
      >
        <IconUserCircle />
        Account
      </DropdownMenuItem>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader className="gap-0">
            <AlertDialogTitle>Edit Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Update your display name. Email is read-only.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="gap-4">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Name</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input value={user.email ?? ""} disabled readOnly />
              </Field>

              <div className="flex gap-4">
                <Controller
                  name="start_date"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Start Date</FieldLabel>
                      <Input
                        {...field}
                        type="text"
                        placeholder="DD/MM/YYYY"
                        inputMode="numeric"
                        pattern="\d{2}/\d{2}/\d{4}"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="end_date"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>End Date</FieldLabel>
                      <Input
                        {...field}
                        type="text"
                        placeholder="DD/MM/YYYY"
                        inputMode="numeric"
                        pattern="\d{2}/\d{2}/\d{4}"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

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
    </>
  );
}
