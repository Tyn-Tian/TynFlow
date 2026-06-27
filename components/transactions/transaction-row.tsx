import React, { useEffect, useState } from "react";
import { Controller, Control, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { IconTrash, IconCalendar, IconCalculator } from "@tabler/icons-react";
import { CalculatorDialog } from "@/components/ui/calculator-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { Calendar } from "@/components/ui/calendar";
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

import { Wallet } from "@/types/wallet-type";
import { Budget } from "@/types/budget-type";
import { Portfolio } from "@/types/portfolio-type";
import { FormValues, getTodayDate } from "./add-multiple-transaction-dialog";

export function TransactionRow({
  index,
  control,
  remove,
  wallets,
  budgets,
  portfolios,
  watch,
  setValue,
}: {
  index: number;
  control: Control<FormValues>;
  remove: (index: number) => void;
  wallets: Wallet[];
  budgets: Budget[];
  portfolios: Portfolio[];
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
}) {
  const [calcOpen, setCalcOpen] = useState(false);
  const [calcInitialValue, setCalcInitialValue] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = React.useRef<HTMLDivElement | null>(null);

  const currentType = watch(`transactions.${index}.type`);

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

  const handleCalculatorInsert = (value: number) => {
    setValue(`transactions.${index}.amount`, value, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <div className="border rounded-lg p-4 mb-4 relative bg-card shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-sm">Transaction #{index + 1}</h4>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => remove(index)}
          className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
        >
          <IconTrash size={18} />
        </Button>
      </div>

      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          name={`transactions.${index}.type`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Type</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Expense">Expense</SelectItem>
                  <SelectItem value="Income">Income</SelectItem>
                  <SelectItem value="Transfer">Transfer</SelectItem>
                  <SelectItem value="Invest">Invest</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {currentType !== "Transfer" && currentType !== "Invest" && (
          <Controller
            name={`transactions.${index}.name`}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Name</FieldLabel>
                <Input {...field} placeholder="Example: Tomoro" autoComplete="off" />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        )}

        <Controller
          name={`transactions.${index}.date`}
          control={control}
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
                <FieldLabel>Date</FieldLabel>
                <div className="relative" ref={datePickerRef}>
                  <div className="flex items-center">
                    <InputGroup>
                      <InputGroupInput
                        value={field.value}
                        placeholder="dd/mm/yyyy"
                        onChange={(e) => field.onChange(format(e.target.value))}
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
                    <div className="absolute z-50 mt-2 bg-popover text-popover-foreground rounded-md shadow-md outline-none">
                      <Calendar
                        mode="single"
                        selected={(() => {
                          try {
                            const [dd, mm, yyyy] = String(field.value || getTodayDate()).split("/");
                            const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
                            return Number.isNaN(d.getTime()) ? undefined : d;
                          } catch {
                            return undefined;
                          }
                        })()}
                        onSelect={(d) => {
                          if (!d) return;
                          const day = Array.isArray(d) ? d[0] : d;
                          const dd = String(day.getDate()).padStart(2, "0");
                          const mm = String(day.getMonth() + 1).padStart(2, "0");
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
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            );
          }}
        />

        <Controller
          name={`transactions.${index}.amount`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Amount</FieldLabel>
              <div className="flex items-center gap-2">
                <Input
                  value={
                    field.value !== undefined && field.value !== null
                      ? field.value.toLocaleString("id-ID")
                      : ""
                  }
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  onChange={(event) =>
                    field.onChange(Number(event.target.value.replace(/\D/g, "")))
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
                  className="w-9 h-10 flex items-center justify-center cursor-pointer px-0"
                >
                  <IconCalculator size={18} />
                </Button>

                <CalculatorDialog
                  open={calcOpen}
                  onOpenChange={setCalcOpen}
                  onInsert={handleCalculatorInsert}
                  initialValue={calcInitialValue}
                  title="Calculator"
                />
              </div>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {currentType === "Expense" && (
          <Controller
            name={`transactions.${index}.budget_id`}
            control={control}
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
                  <SelectContent>
                    {budgets?.map((b) => (
                      <SelectItem key={b.id} value={String(b.id)}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        )}

        {(currentType === "Expense" || currentType === "Income") && (
          <Controller
            name={`transactions.${index}.wallet_id`}
            control={control}
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
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        )}

        {currentType === "Transfer" && (
          <>
            <Controller
              name={`transactions.${index}.wallet_id`}
              control={control}
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
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name={`transactions.${index}.transfer_id`}
              control={control}
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
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            
            <Controller
              name={`transactions.${index}.admin_fee`}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Admin Fee (optional)</FieldLabel>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={(field.value ?? 0).toLocaleString("id-ID")}
                    onChange={(e) => field.onChange(Number(e.target.value.replace(/\D/g, "")))}
                  />
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </>
        )}

        {currentType === "Invest" && (
          <>
            <Controller
              name={`transactions.${index}.wallet_id`}
              control={control}
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
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name={`transactions.${index}.portfolio_id`}
              control={control}
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
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            
            <Controller
              name={`transactions.${index}.admin_fee`}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Admin Fee (optional)</FieldLabel>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={(field.value ?? 0).toLocaleString("id-ID")}
                    onChange={(e) => field.onChange(Number(e.target.value.replace(/\D/g, "")))}
                  />
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </>
        )}
      </FieldGroup>
    </div>
  );
}
