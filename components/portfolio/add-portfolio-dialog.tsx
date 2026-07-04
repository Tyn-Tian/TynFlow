"use client";

import { useState } from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconCalculator, IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { type PortfolioType } from "@/components/portfolio/portfolio-data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PortfolioDto } from "@/types/portfolio-type";
import { portfolioApi } from "@/lib/api/portfolio-api";
import { CalculatorDialog } from "@/components/ui/calculator-dialog";

const portfolioTypes: PortfolioType[] = [
  "Reksadana",
  "Saham",
  "Crypto",
  "Emas",
  "Obligasi",
];

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  type: z.enum(portfolioTypes),
  target: z.number().min(0, "Target must be at least 0"),
  invested: z.number().min(0, "Invested must be at least 0"),
  currentValue: z.number().min(0, "Current value must be at least 0"),
});

type FormValues = z.infer<typeof formSchema>;

export function AddPortfolioDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [calcField, setCalcField] = useState<
    "invested" | "currentValue" | null
  >(null);
  const [calcInitialValue, setCalcInitialValue] = useState<number>(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "Reksadana",
      target: 0,
      invested: 0,
      currentValue: 0,
    },
  });

  const openCalculator = (
    fieldName: "invested" | "currentValue",
    value: number,
  ) => {
    setCalcField(fieldName);
    setCalcInitialValue(value ?? 0);
    setCalcOpen(true);
  };

  const handleCalculatorInsert = (value: number) => {
    if (!calcField) return;

    form.setValue(calcField, value, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setCalcField(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset({
        name: "",
        type: "Reksadana",
        target: 0,
        invested: 0,
        currentValue: 0,
      });
      setCalcOpen(false);
      setCalcField(null);
    }
  };

  const mutation = useMutation({
    mutationFn: async (dto: PortfolioDto) => await portfolioApi.add(dto),
    onSuccess: () => {
      toast.success("Success", {
        description: "Portfolio has been added.",
        duration: 3000,
      });
      handleOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
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

  async function onSubmit(values: FormValues) {
    mutation.mutate({
      name: values.name,
      type: values.type,
      target: values.target,
      invested: values.invested,
      current_value: values.currentValue,
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button className="cursor-pointer">
          <IconPlus />
          <span className="hidden sm:block">
            Add Portfolio
          </span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader className="gap-0">
          <AlertDialogTitle>Add Portfolio</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="portfolio-name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="portfolio-name"
                    placeholder="Example: Bitcoin"
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
              name="type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Type</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      aria-invalid={fieldState.invalid}
                      className="w-full"
                    >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {portfolioTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="target"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="portfolio-target">Target</FieldLabel>
                  <Input
                    value={
                      field.value !== undefined && field.value !== null
                        ? field.value.toLocaleString("id-ID")
                        : ""
                    }
                    id="portfolio-target"
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

            <Controller
              name="invested"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="portfolio-invested">Invested</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      value={
                        field.value !== undefined && field.value !== null
                          ? field.value.toLocaleString("id-ID")
                          : ""
                      }
                      id="portfolio-invested"
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      className="flex-1"
                      onChange={(event) =>
                        field.onChange(
                          Number(event.target.value.replace(/\D/g, "")),
                        )
                      }
                    />
                    <Button
                      type="button"
                      aria-label="Open calculator for invested"
                      onClick={() =>
                        openCalculator("invested", field.value ?? 0)
                      }
                      className="w-9 cursor-pointer items-center justify-center"
                    >
                      <IconCalculator />
                    </Button>
                  </div>
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="currentValue"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="portfolio-current-value">
                    Current Value
                  </FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      value={
                        field.value !== undefined && field.value !== null
                          ? field.value.toLocaleString("id-ID")
                          : ""
                      }
                      id="portfolio-current-value"
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      className="flex-1"
                      onChange={(event) =>
                        field.onChange(
                          Number(event.target.value.replace(/\D/g, "")),
                        )
                      }
                    />
                    <Button
                      type="button"
                      aria-label="Open calculator for current value"
                      onClick={() =>
                        openCalculator("currentValue", field.value ?? 0)
                      }
                      className="w-9 cursor-pointer items-center justify-center"
                    >
                      <IconCalculator />
                    </Button>
                  </div>
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <CalculatorDialog
              open={calcOpen}
              onOpenChange={(isOpen) => {
                setCalcOpen(isOpen);
                if (!isOpen) setCalcField(null);
              }}
              onInsert={handleCalculatorInsert}
              initialValue={calcInitialValue}
              title="Calculator"
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
