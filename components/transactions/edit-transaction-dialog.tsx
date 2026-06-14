"use client";

import React, { useEffect, useState } from "react";
import { z } from "zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { IconCalculator, IconCalendar } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
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
import { DeleteTransactionDialog } from "./delete-transaction-dialog";
import useWallet from "@/hooks/use-wallet";
import useBudget from "@/hooks/use-budget";
import usePortfolio from "@/hooks/use-portfolio";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { transactionService } from "@/services/transaction-service";
import { TransactionDto } from "@/types/transaction-type";

const formSchema = z.object({
  name: z.string().optional(),
  type: z.enum(["Expense", "Income", "Transfer", "Invest"]),
  date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/),
  amount: z.number().int().min(1),
  budget_id: z.string().optional().nullable(),
  wallet_id: z.string().optional().nullable(),
  transfer_id: z.string().optional().nullable(),
  portfolio_id: z.string().optional().nullable(),
  admin_fee: z.number().int().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type TxItem = {
  id: number | string;
  name: string;
  date: string;
  amount: number;
  budget_id?: string | null;
  wallet_id?: string | null;
  transfer_id?: string | null;
  portfolio_id?: string | null;
  type?: "Income" | "Expense" | "Transfer" | "Invest";
  admin_fee?: number | null;
};

type Props = { tx?: TxItem | null; onClose?: () => void };

export function EditTransactionDialog({ tx, onClose }: Props) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = React.useRef<HTMLDivElement | null>(null);

  const { data: wallets } = useWallet();
  const { data: budgets } = useBudget(true);
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

  const pad = (n: number) => String(n).padStart(2, "0");
  const toIsoDate = (d: string) => {
    const [dd, mm, yyyy] = d.split("/");
    const day = Number(dd);
    const month = Number(mm);
    const year = Number(yyyy);
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const defaultDate = tx ? new Date(tx.date) : new Date();
  const defaultDateStr = `${pad(defaultDate.getDate())}/${pad(defaultDate.getMonth() + 1)}/${defaultDate.getFullYear()}`;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: tx?.name ?? "",
      type:
        (tx?.type as "Expense" | "Income" | "Transfer" | "Invest") ?? "Expense",
      date: defaultDateStr,
      amount: tx?.amount ?? 0,
      budget_id: tx?.budget_id ?? undefined,
      wallet_id: tx?.wallet_id ?? undefined,
      transfer_id: tx?.transfer_id ?? undefined,
      portfolio_id: tx?.portfolio_id ?? undefined,
      admin_fee: tx?.admin_fee ?? 0,
    },
  });
  const currentType = useWatch({
    control: form.control,
    name: "type",
  });

  const [calcOpen, setCalcOpen] = useState(false);
  const [calcExpr, setCalcExpr] = useState<string>("0");

  const pressCalc = (v: string) => {
    if (v === "C") return setCalcExpr("0");
    if (v === "DEL")
      return setCalcExpr((s) => (s.length <= 1 ? "0" : s.slice(0, -1)));
    setCalcExpr((s) => (s === "0" ? v : s + v));
  };
  const evalCalc = () => {
    try {
      const res = Function(`"use strict";return (${calcExpr})`)();
      setCalcExpr(String(Number.isFinite(res) ? res : 0));
    } catch {
      setCalcExpr("0");
    }
  };
  const insertCalc = () => {
    try {
      const res = Function(`"use strict";return (${calcExpr})`)();
      const val = Math.max(
        0,
        Math.round(Number.isFinite(res) ? Number(res) : 0),
      );
      form.setValue("amount", val, { shouldValidate: true, shouldDirty: true });
    } catch {
      form.setValue("amount", 0, { shouldValidate: true, shouldDirty: true });
    } finally {
      setCalcOpen(false);
      setCalcExpr("0");
    }
  };

  const formatExprForDisplay = (expr: string) => {
    return expr.replace(/\d+(?:\.\d+)?/g, (m) => {
      try {
        const n = Number(m);
        if (Number.isNaN(n)) return m;
        return n.toLocaleString("id-ID");
      } catch {
        return m;
      }
    });
  };

  const calcResultValue = () => {
    try {
      let expr = String(calcExpr);
      while (expr.length && /[+\-*/\.]$/.test(expr)) expr = expr.slice(0, -1);
      if (!expr) return 0;
      const res = Function(`"use strict";return (${expr})`)();
      return Math.max(0, Math.round(Number.isFinite(res) ? Number(res) : 0));
    } catch {
      return 0;
    }
  };

  const formatCalcResult = () => {
    return calcResultValue().toLocaleString("id-ID");
  };

  const { data } = useQuery({
    queryKey: ["transaction", tx?.id],
    queryFn: async () => {
      if (!tx?.id) return null;
      return await transactionService.getById(String(tx.id));
    },
    enabled: !!tx?.id,
  });

  useEffect(() => {
    if (!tx) {
      setTimeout(() => setOpen(false), 0);
      return;
    }
    const initialDate = new Date(tx.date);
    const initialDateStr = !Number.isNaN(initialDate.getTime())
      ? `${pad(initialDate.getDate())}/${pad(initialDate.getMonth() + 1)}/${initialDate.getFullYear()}`
      : defaultDateStr;

    form.reset({
      name: tx.name,
      type:
        (tx?.type as "Expense" | "Income" | "Transfer" | "Invest") ?? "Expense",
      date: initialDateStr,
      amount: tx.amount,
      budget_id: tx?.budget_id ? String(tx.budget_id) : undefined,
      wallet_id: tx?.wallet_id ? String(tx.wallet_id) : undefined,
      transfer_id: tx?.transfer_id ? String(tx.transfer_id) : undefined,
      portfolio_id: tx?.portfolio_id ? String(tx.portfolio_id) : undefined,
      admin_fee: tx?.admin_fee ?? 0,
    });
    setTimeout(() => setOpen(true), 0);
  }, [tx, defaultDateStr, form]);

  useEffect(() => {
    if (data) {
      const d = new Date(data.date);
      const dateStr = !Number.isNaN(d.getTime())
        ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
        : defaultDateStr;

      form.reset({
        name: data.name,
        type:
          (data.type as "Expense" | "Income" | "Transfer" | "Invest") ??
          "Expense",
        date: dateStr,
        amount: data.amount,
        budget_id: data.budget_id ? String(data.budget_id) : undefined,
        wallet_id: data.wallet_id ? String(data.wallet_id) : undefined,
        transfer_id: data.transfer_id ? String(data.transfer_id) : undefined,
        portfolio_id: data.portfolio_id ? String(data.portfolio_id) : undefined,
        admin_fee: data.admin_fee ?? 0,
      });
    }
  }, [data, defaultDateStr, form]);

  const mutation = useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: TransactionDto }) =>
      await transactionService.edit(id, dto),
    onSuccess: () => {
      toast.success("Success", {
        description: "Transaction updated.",
        duration: 3000,
      });
      form.reset();
      setOpen(false);
      onClose?.();
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
    },
    onError: (err: Error | unknown) => {
      toast.error("Failed", {
        description: err instanceof Error ? err.message : "Unexpected error.",
        duration: 3000,
      });
    },
  });

  async function onSubmit(values: FormValues) {
    if (!tx) return;
    const isoDate = toIsoDate(values.date);
    mutation.mutate({
      id: String(tx.id),
      dto: {
        name:
          values.type === "Transfer" || values.type === "Invest"
            ? values.type
            : (values.name ?? ""),
        date: isoDate,
        amount: values.amount,
        type: values.type,
        budget_id: values.budget_id ?? null,
        wallet_id: values.wallet_id ?? null,
        transfer_id: values.transfer_id ?? null,
        portfolio_id: values.portfolio_id ?? null,
        admin_fee: values.admin_fee ?? 0,
      },
    });
  }
  const [showDelete, setShowDelete] = useState(false);

  return (
    <>
      <AlertDialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) onClose?.();
        }}
      >
        <AlertDialogTrigger asChild>
          <div />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Transaction</AlertDialogTitle>
          </AlertDialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="gap-4">
              {currentType !== "Transfer" && currentType !== "Invest" && (
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="transaction-name">Name</FieldLabel>
                      <Input
                        {...field}
                        id="transaction-name"
                        placeholder="Example: Tomoro"
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              )}

              <Controller
                name="date"
                control={form.control}
                render={({ field, fieldState }) => {
                  const format = (v: string) => {
                    const digits = v.replace(/\D/g, "").slice(0, 8);
                    const parts: string[] = [];
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
                      <FieldLabel htmlFor="transaction-date">Date</FieldLabel>
                      <div className="relative" ref={datePickerRef}>
                        <div className="flex items-center">
                          <InputGroup>
                            <InputGroupInput
                              id="transaction-date"
                              value={field.value}
                              placeholder="dd/mm/yyyy"
                              onChange={(e) =>
                                field.onChange(format(e.target.value))
                              }
                              autoComplete="off"
                              className="flex-1"
                            />
                            <InputGroupAddon align="inline-end">
                              <IconCalendar
                                className="cursor-pointer"
                                onClick={() => setShowDatePicker(true)}
                              />
                            </InputGroupAddon>
                          </InputGroup>
                        </div>

                        {showDatePicker && (
                          <div className="absolute z-50 mt-2">
                            <Calendar
                              mode="single"
                              selected={(() => {
                                try {
                                  const [dd, mm, yyyy] = String(
                                    field.value || defaultDateStr,
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
                                const dd = String(day.getDate()).padStart(
                                  2,
                                  "0",
                                );
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
                    <FieldLabel htmlFor="transaction-amount">Amount</FieldLabel>
                    <div className="flex items-center gap-2">
                      <Input
                        value={
                          field.value !== undefined && field.value !== null
                            ? field.value.toLocaleString("id-ID")
                            : ""
                        }
                        id="transaction-amount"
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
                          setCalcExpr(String(field.value ?? 0));
                          setCalcOpen(true);
                        }}
                        className="w-9 h-10 flex items-center justify-center cursor-pointer"
                      >
                        <IconCalculator />
                      </Button>

                      <AlertDialog
                        open={calcOpen}
                        onOpenChange={(v) => {
                          setCalcOpen(v);
                          if (v) setCalcExpr(String(field.value ?? 0));
                        }}
                      >
                        <AlertDialogContent className="w-96">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Calculator</AlertDialogTitle>
                          </AlertDialogHeader>

                          <div className="mb-4 text-right text-2xl font-medium">
                            {formatExprForDisplay(calcExpr)}
                          </div>

                          <div className="grid grid-cols-4 gap-2">
                            {[
                              "C",
                              "DEL",
                              "/",
                              "*",
                              "7",
                              "8",
                              "9",
                              "-",
                              "4",
                              "5",
                              "6",
                              "+",
                              "1",
                              "2",
                              "3",
                              "=",
                              "0",
                            ].map((k) => (
                              <Button
                                key={k}
                                type="button"
                                onClick={() => {
                                  if (k === "DEL") pressCalc("DEL");
                                  else if (k === "C") pressCalc("C");
                                  else if (k === "+") pressCalc("+");
                                  else if (k === "=") evalCalc();
                                  else pressCalc(k);
                                }}
                                className={
                                  k === "C"
                                    ? "bg-rose-500 text-white hover:bg-rose-500 hover:text-white"
                                    : ""
                                }
                              >
                                {k}
                              </Button>
                            ))}
                            <Button
                              className="col-span-3 cursor-pointer"
                              onClick={() => insertCalc()}
                            >
                              Rp {formatCalcResult()}
                            </Button>
                          </div>

                          <div className="mt-4 flex justify-end gap-2">
                            <AlertDialogCancel
                              onClick={() => setCalcOpen(false)}
                              className="cursor-pointer"
                            >
                              Close
                            </AlertDialogCancel>
                            <Button
                              onClick={() => {
                                insertCalc();
                              }}
                              className="cursor-pointer"
                            >
                              Insert
                            </Button>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {currentType === "Expense" && (
                <Controller
                  name="budget_id"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Budget</FieldLabel>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(v) => field.onChange(v || undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget" />
                        </SelectTrigger>
                        <SelectContent>
                          {budgets?.map((b) => (
                            <SelectItem key={b.id} value={String(b.id)} disabled={!!b.deleted_at}>
                              {b.name} {!!b.deleted_at ? "(Deleted)" : ""}
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

              {currentType === "Transfer" ? (
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
                          <SelectContent>
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
                          <SelectContent>
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
                        <FieldLabel htmlFor="transaction-admin-fee">
                          Admin Fee (optional)
                        </FieldLabel>
                        <Input
                          id="transaction-admin-fee"
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
              ) : currentType === "Invest" ? (
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
                          <SelectContent>
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
                          <SelectContent>
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
                        <FieldLabel htmlFor="transaction-admin-fee">
                          Admin Fee (optional)
                        </FieldLabel>
                        <Input
                          id="transaction-admin-fee"
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
                        <SelectContent>
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

              <AlertDialogFooter>
                <AlertDialogCancel type="button" className="cursor-pointer">
                  Cancel
                </AlertDialogCancel>
                <Button
                  variant="destructive"
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setShowDelete(true);
                  }}
                  className="cursor-pointer bg-rose-500!"
                >
                  Delete
                </Button>
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

      {showDelete && tx && (
        <DeleteTransactionDialog
          tx={tx}
          onDeleted={() => {
            setShowDelete(false);
            onClose?.();
          }}
          onClose={() => {
            setShowDelete(false);
            setOpen(true);
          }}
        />
      )}
    </>
  );
}
