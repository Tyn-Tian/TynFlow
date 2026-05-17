"use client";

import React, { useEffect, useState } from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { IconCalendar, IconPlus } from "@tabler/icons-react";

import { LIVE_PLATFORMS } from "@/components/live/live-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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
import { LiveDto } from "@/types/live-type";
import { liveService } from "@/services/live-service";

const formSchema = z.object({
  date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be in dd/mm/yyyy"),
  type: z.enum(["Lembur", "Biasa"]),
  tiktok: z.number().int().min(0, "Sales must be at least 0"),
  shopee: z.number().int().min(0, "Sales must be at least 0"),
});

type FormValues = z.infer<typeof formSchema>;

export function AddLiveDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!datePickerRef.current) return;
      const target = event.target as Node;
      if (showDatePicker && !datePickerRef.current.contains(target)) {
        setShowDatePicker(false);
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowDatePicker(false);
      }
    }

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [showDatePicker]);

  const pad = (value: number) => String(value).padStart(2, "0");
  const today = new Date();
  const defaultDate = `${pad(today.getDate())}/${pad(today.getMonth() + 1)}/${today.getFullYear()}`;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: defaultDate,
      type: "Biasa",
      tiktok: 0,
      shopee: 0,
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset({
        date: defaultDate,
        type: "Biasa",
        tiktok: 0,
        shopee: 0,
      });
      setShowDatePicker(false);
    }
  };

  const mutation = useMutation({
    mutationFn: async (dto: LiveDto) => await liveService.add(dto),
    onSuccess: () => {
      toast.success("Success", {
        description: "Live has been added.",
        duration: 3000,
      });
      handleOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["lives"] });
    },
    onError: (error) => {
      console.log(error)
      toast.error("Failed", {
        description:
          error instanceof Error ? error.message : "Unexpected error.",
        duration: 3000,
      });
    },
  });

  function onSubmit(values: FormValues) {
    mutation.mutate(values);
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button className="cursor-pointer">
          <IconPlus />
          Add Live
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader className="gap-0">
          <AlertDialogTitle>Add Live</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            <Controller
              name="date"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="live-date">Date</FieldLabel>
                  <div className="relative" ref={datePickerRef}>
                    <Input
                      {...field}
                      id="live-date"
                      placeholder="dd/mm/yyyy"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      onClick={() => setShowDatePicker((value) => !value)}
                      readOnly
                      className="pr-10 cursor-pointer"
                    />
                    <button
                      type="button"
                      title="Open calendar"
                      aria-label="Open calendar"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground cursor-pointer"
                      onClick={() => setShowDatePicker((value) => !value)}
                    >
                      <IconCalendar className="size-4" />
                    </button>
                    {showDatePicker && (
                      <div className="absolute z-50 mt-2 rounded-xl border bg-background p-3 shadow-lg">
                        <Calendar
                          mode="single"
                          selected={(() => {
                            const [dd, mm, yyyy] = field.value.split("/");
                            const date = new Date(
                              Number(yyyy),
                              Number(mm) - 1,
                              Number(dd),
                            );
                            return Number.isNaN(date.getTime())
                              ? new Date()
                              : date;
                          })()}
                          onSelect={(date) => {
                            if (!date) return;
                            field.onChange(
                              `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`,
                            );
                            setShowDatePicker(false);
                          }}
                        />
                      </div>
                    )}
                  </div>
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
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Biasa">Biasa</SelectItem>
                      <SelectItem value="Lembur">Lembur</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {LIVE_PLATFORMS.map((platform) => (
                <Controller
                  key={platform.id}
                  name={platform.id}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`live-${platform.id}`}>
                        {platform.label}
                      </FieldLabel>
                      <Input
                        value={
                          field.value !== undefined && field.value !== null
                            ? field.value.toLocaleString("id-ID")
                            : ""
                        }
                        id={`live-${platform.id}`}
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
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
              ))}
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
  );
}
