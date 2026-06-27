"use client";

import React, { useEffect, useState } from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { IconPlus, IconCalculator, IconCalendar } from "@tabler/icons-react";
import { CalculatorDialog } from "@/components/ui/calculator-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
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
import useWallet from "@/hooks/use-wallet";
import useBudget from "@/hooks/use-budget";
import usePortfolio from "@/hooks/use-portfolio";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SchedulerDto } from "@/types/scheduler-type";
import { schedulerService } from "@/services/scheduler-service";

const formSchema = z.object({
  name: z.string().optional(),
  amount: z.number().int().min(0, "Amount must be at least 0"),
  budget_id: z.string().optional(),
  wallet_id: z.string().optional(),
  transfer_id: z.string().optional(),
  portfolio_id: z.string().optional(),
  admin_fee: z.number().int().min(0).optional(),
  frequency: z.enum(["Daily", "Weekly", "Monthly", "Yearly"]),
  next_run_date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be in dd/mm/yyyy"),
});

type FormValues = z.infer<typeof formSchema>;

export function AddSchedulerDialog() {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [calcInitialValue, setCalcInitialValue] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = React.useRef<HTMLDivElement | null>(null);

  const { data: wallets } = useWallet();
  const { data: budgets } = useBudget();
  const { data: portfolios } = usePortfolio();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!datePickerRef.current) return;
      const target = e.target as Node;
      if (showDatePicker && !datePickerRef.current.contains(target))
        setShowDatePicker(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShowDatePicker(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [showDatePicker]);
  const [tab, setTab] = useState<"Expense" | "Income" | "Transfer" | "Invest">(
    "Expense",
  );

  const pad = (n: number) => String(n).padStart(2, "0");
  const today = new Date();
  const defaultDate = `${pad(today.getDate())}/${pad(today.getMonth() + 1)}/${today.getFullYear()}`;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: 0,
      budget_id: undefined,
      wallet_id: undefined,
      transfer_id: undefined,
      portfolio_id: undefined,
      admin_fee: 0,
      frequency: "Monthly",
      next_run_date: defaultDate,
    },
  });

  const handleCalculatorInsert = (value: number) => {
    form.setValue("amount", value, { shouldValidate: true, shouldDirty: true });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();

      setShowDatePicker(false);
    }
  };

  const mutation = useMutation({
    mutationFn: async (dto: SchedulerDto) =>
      await schedulerService.add(dto),
    onSuccess: () => {
      toast.success("Success", {
        description: "Scheduler added.",
        duration: 3000,
      });
      setTab("Expense");
      handleOpenChange(false);
      queryClient.invalidateQueries({
        queryKey: ["schedulers"],
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
    const toIsoDate = (d: string) => {
      const [dd, mm, yyyy] = d.split("/");
      const day = Number(dd);
      const month = Number(mm);
      const year = Number(yyyy);
      const dt = new Date(year, month - 1, day);
      if (
        dt.getFullYear() !== year ||
        dt.getMonth() !== month - 1 ||
        dt.getDate() !== day
      ) {
        throw new Error("Invalid date");
      }
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    };

    const isoDate = toIsoDate(values.next_run_date);

    if (
      tab !== "Transfer" &&
      tab !== "Invest" &&
      (!values.name || !values.name.trim())
    ) {
      toast.error("Name is required.", { duration: 3000 });
      return;
    }

    if (tab === "Transfer") {
      if (!values.wallet_id || !values.transfer_id) {
        toast.error("Please select both source and destination wallets.", {
          duration: 3000,
        });
        return;
      }

      if (values.wallet_id === values.transfer_id) {
        toast.error("Source and destination wallets must be different.", {
          duration: 3000,
        });
        return;
      }
    }

    if (tab === "Invest") {
      if (!values.wallet_id || !values.portfolio_id) {
        toast.error("Please select both wallet and portfolio.", {
          duration: 3000,
        });
        return;
      }
    }

    mutation.mutate({
      name:
        tab === "Transfer"
          ? "Transfer"
          : tab === "Invest"
            ? "Invest"
            : (values.name ?? ""),
      amount: values.amount,
      type: tab,
      budget_id: values.budget_id ?? null,
      wallet_id: values.wallet_id ?? null,
      transfer_id: values.transfer_id ?? null,
      portfolio_id: values.portfolio_id ?? null,
      admin_fee: values.admin_fee ?? 0,
      frequency: values.frequency,
      next_run_date: isoDate,
      status: "Active", // default to active
    });
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button className="cursor-pointer">
          <IconPlus />
          <span className="hidden sm:block">
            Add Scheduler
          </span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add Scheduler</DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col overflow-y-auto px-4 pb-6">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs
              value={tab}
              onValueChange={(v) =>
                setTab(v as "Expense" | "Income" | "Transfer" | "Invest")
              }
              className="mb-6"
            >
              <TabsList className="mx-auto">
                <TabsTrigger value="Expense" className="cursor-pointer">
                  Expense
                </TabsTrigger>
                <TabsTrigger value="Income" className="cursor-pointer">
                  Income
                </TabsTrigger>
                <TabsTrigger value="Transfer" className="cursor-pointer">
                  Transfer
                </TabsTrigger>
                <TabsTrigger value="Invest" className="cursor-pointer">
                  Invest
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <FieldGroup className="gap-6">
              {tab !== "Transfer" && tab !== "Invest" && (
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="scheduler-name">Name</FieldLabel>
                      <Input
                        {...field}
                        id="scheduler-name"
                        placeholder="Example: Monthly Rent"
                        autoComplete="off"
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              )}

              <Controller
                name="frequency"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Frequency</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => field.onChange(v as "Daily" | "Weekly" | "Monthly" | "Yearly")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="next_run_date"
                control={form.control}
                render={({ field, fieldState }) => {
                  const format = (v: string) => {
                    const digits = v.replace(/\D/g, "").slice(0, 8);
                    const parts = [];
                    if (digits.length >= 2) {
                      parts.push(digits.slice(0, 2));
                      if (digits.length >= 4) {
                        parts.push(digits.slice(2, 4));
                        if (digits.length > 4) parts.push(digits.slice(4));
                      } else if (digits.length > 2) {
                        parts.push(digits.slice(2));
                      }
                    } else {
                      parts.push(digits);
                    }
                    return parts.join("/");
                  };

                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="scheduler-date">Next Run Date</FieldLabel>
                      <div className="relative" ref={datePickerRef}>
                        <div className="flex items-center">
                          <Input
                            id="scheduler-date"
                            value={field.value}
                            placeholder="dd/mm/yyyy"
                            onChange={(e) =>
                              field.onChange(format(e.target.value))
                            }
                            autoComplete="off"
                            className="flex-1"
                          />

                          <button
                            type="button"
                            aria-label="Open date picker"
                            onClick={() => {
                              setShowDatePicker(true);
                            }}
                            className="w-9 h-10 flex items-center justify-center ml-2 cursor-pointer"
                          >
                            <IconCalendar />
                          </button>
                        </div>

                        {showDatePicker && (
                          <div className="absolute z-50 mt-2">
                            <Calendar
                              mode="single"
                              selected={(() => {
                                try {
                                  const [dd, mm, yyyy] = String(
                                    field.value || defaultDate,
                                  ).split("/");
                                  const d = new Date(
                                    Number(yyyy),
                                    Number(mm) - 1,
                                    Number(dd),
                                  );
                                  return Number.isNaN(d.getTime())
                                    ? undefined
                                    : d;
                                } catch {
                                  return undefined;
                                }
                              })()}
                              onSelect={(d) => {
                                if (!d) return;
                                const day = Array.isArray(d) ? d[0] : d;
                                const dd = String(day.getDate()).padStart(2, "0");
                                const mm = String(day.getMonth() + 1).padStart(
                                  2,
                                  "0",
                                );
                                const yyyy = String(day.getFullYear());
                                field.onChange(`${dd}/${mm}/${yyyy}`);
                                setShowDatePicker(false);
                              }}
                              className="rounded-lg border"
                              captionLayout="dropdown"
                              fromYear={new Date().getFullYear()}
                              toYear={new Date().getFullYear() + 10}
                            />
                          </div>
                        )}
                      </div>
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
              />

              <Controller
                name="amount"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="scheduler-amount">Amount</FieldLabel>
                    <div className="flex items-center gap-2">
                      <Input
                        value={
                          field.value !== undefined && field.value !== null
                            ? field.value.toLocaleString("id-ID")
                            : ""
                        }
                        id="scheduler-amount"
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        onChange={(event) =>
                          field.onChange(
                            Number(event.target.value.replace(/\D/g, "")),
                          )
                        }
                        className="flex-1"
                      />

                    <Button
                      type="button"
                      aria-label="Open calculator"
                      onClick={() => {
                        setCalcInitialValue(field.value ?? 0);
                        setCalcOpen(true);
                      }}
                      className="w-9 h-10 flex items-center justify-center cursor-pointer"
                    >
                      <IconCalculator />
                    </Button>

                    <CalculatorDialog
                      open={calcOpen}
                      onOpenChange={setCalcOpen}
                      onInsert={handleCalculatorInsert}
                      initialValue={calcInitialValue}
                      title="Calculator"
                    />
                    </div>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {tab === "Expense" && (
                <Controller
                  name="budget_id"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Budget</FieldLabel>
                      <Select
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(v) => field.onChange(v || undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {budgets?.map((b) => (
                            <SelectItem key={b.id} value={String(b.id)}>
                              {b.name}
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
              )}

              {tab === "Transfer" ? (
                <>
                  <Controller
                    name="wallet_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>From Wallet</FieldLabel>
                        <Select
                          value={field.value ? String(field.value) : ""}
                          onValueChange={(v) => field.onChange(v || undefined)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select source wallet" />
                          </SelectTrigger>
                          <SelectContent position="popper">
                            {wallets?.map((w) => (
                              <SelectItem key={w.id} value={String(w.id)}>
                                {w.name}
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
                    name="transfer_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>To Wallet</FieldLabel>
                        <Select
                          value={field.value ? String(field.value) : ""}
                          onValueChange={(v) => field.onChange(v || undefined)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination wallet" />
                          </SelectTrigger>
                          <SelectContent position="popper">
                            {wallets?.map((w) => (
                              <SelectItem key={w.id} value={String(w.id)}>
                                {w.name}
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
                    name="admin_fee"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="scheduler-admin-fee">
                          Admin Fee (optional)
                        </FieldLabel>
                        <Input
                          id="scheduler-admin-fee"
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={(field.value ?? 0).toLocaleString("id-ID")}
                          onChange={(e) =>
                            field.onChange(
                              Number(e.target.value.replace(/\D/g, "")),
                            )
                          }
                        />
                        {fieldState.error && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </>
              ) : tab === "Invest" ? (
                <>
                  <Controller
                    name="wallet_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>From Wallet</FieldLabel>
                        <Select
                          value={field.value ? String(field.value) : ""}
                          onValueChange={(v) => field.onChange(v || undefined)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select source wallet" />
                          </SelectTrigger>
                          <SelectContent position="popper">
                            {wallets?.map((w) => (
                              <SelectItem key={w.id} value={String(w.id)}>
                                {w.name}
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
                    name="portfolio_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>To Portfolio</FieldLabel>
                        <Select
                          value={field.value ? String(field.value) : ""}
                          onValueChange={(v) => field.onChange(v || undefined)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination portfolio" />
                          </SelectTrigger>
                          <SelectContent position="popper">
                            {portfolios?.map((p) => (
                              <SelectItem key={p.id} value={String(p.id)}>
                                {p.name}
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
                    name="admin_fee"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="scheduler-admin-fee">
                          Admin Fee (optional)
                        </FieldLabel>
                        <Input
                          id="scheduler-admin-fee"
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={(field.value ?? 0).toLocaleString("id-ID")}
                          onChange={(e) =>
                            field.onChange(
                              Number(e.target.value.replace(/\D/g, "")),
                            )
                          }
                        />
                        {fieldState.error && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </>
              ) : (
                <Controller
                  name="wallet_id"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Wallet</FieldLabel>
                      <Select
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(v) => field.onChange(v || undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select wallet" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {wallets?.map((w) => (
                            <SelectItem key={w.id} value={String(w.id)}>
                              {w.name}
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
              )}

              <DrawerFooter className="px-0 pt-4 pb-0 flex gap-2">
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="cursor-pointer flex-1"
                >
                  {mutation.isPending ? "Saving..." : "Save"}
                </Button>
                <DrawerClose asChild>
                  <Button type="button" variant="outline" className="cursor-pointer flex-1">
                    Cancel
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </FieldGroup>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
