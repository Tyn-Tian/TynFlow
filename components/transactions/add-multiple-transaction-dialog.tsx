"use client";

import { useState } from "react";
import { z } from "zod";
import {
  useForm,
  useFieldArray,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  IconPlus,
  IconLayersLinked,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import useWallet from "@/hooks/use-wallet";
import useBudget from "@/hooks/use-budget";
import usePortfolio from "@/hooks/use-portfolio";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionApi } from "@/lib/api/transaction-api";
import { TransactionDto } from "@/types/transaction-type";
import { TransactionRow } from "./transaction-row";

const transactionRowSchema = z.object({
  name: z.string().optional(),
  date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be in dd/mm/yyyy"),
  amount: z.number().int().min(0, "Amount must be at least 0"),
  type: z.enum(["Expense", "Income", "Transfer", "Invest"]),
  budget_id: z.string().optional(),
  wallet_id: z.string().optional(),
  transfer_id: z.string().optional(),
  portfolio_id: z.string().optional(),
  admin_fee: z.number().int().min(0).optional(),
});

const formSchema = z.object({
  transactions: z
    .array(transactionRowSchema)
    .min(1, "At least one transaction is required"),
});

export type FormValues = z.infer<typeof formSchema>;

export const pad = (n: number) => String(n).padStart(2, "0");
export const getTodayDate = () => {
  const today = new Date();
  return `${pad(today.getDate())}/${pad(today.getMonth() + 1)}/${today.getFullYear()}`;
};



export function AddMultipleTransactionDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: walletData } = useWallet();
  const { data: budgetData } = useBudget();
  const { data: portfolios } = usePortfolio();

  const wallets = walletData?.data;
  const budgets = budgetData?.data;

  const defaultValues = {
    transactions: [
      {
        name: "",
        date: getTodayDate(),
        amount: 0,
        type: "Expense" as const,
        budget_id: undefined,
        wallet_id: undefined,
        transfer_id: undefined,
        portfolio_id: undefined,
        admin_fee: 0,
      },
    ],
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "transactions",
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset(defaultValues);
    }
  };

  const mutation = useMutation({
    mutationFn: async (dtos: TransactionDto[]) => await transactionApi.addMany(dtos),
    onSuccess: () => {
      toast.success("Success", {
        description: "Multiple transactions added.",
        duration: 3000,
      });
      handleOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["enriched-budgets"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
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

    const dtos: TransactionDto[] = [];
    for (let i = 0; i < values.transactions.length; i++) {
      const item = values.transactions[i];
      const { type } = item;

      if (type !== "Transfer" && type !== "Invest" && (!item.name || !item.name.trim())) {
        toast.error(`Name is required for transaction #${i + 1}.`, { duration: 3000 });
        return;
      }

      if (type === "Transfer") {
        if (!item.wallet_id || !item.transfer_id) {
          toast.error(`Please select both source and destination wallets for transaction #${i + 1}.`, { duration: 3000 });
          return;
        }
        if (item.wallet_id === item.transfer_id) {
          toast.error(`Source and destination wallets must be different for transaction #${i + 1}.`, { duration: 3000 });
          return;
        }
      }

      if (type === "Invest") {
        if (!item.wallet_id || !item.portfolio_id) {
          toast.error(`Please select both wallet and portfolio for transaction #${i + 1}.`, { duration: 3000 });
          return;
        }
      }

      dtos.push({
        name: type === "Transfer" ? "Transfer" : type === "Invest" ? "Invest" : (item.name ?? ""),
        date: toIsoDate(item.date),
        amount: item.amount,
        type: item.type,
        budget_id: item.budget_id ?? null,
        wallet_id: item.wallet_id ?? null,
        transfer_id: item.transfer_id ?? null,
        portfolio_id: item.portfolio_id ?? null,
        admin_fee: item.admin_fee ?? 0,
      });
    }

    mutation.mutate(dtos);
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button className="cursor-pointer">
          <IconLayersLinked />
          <span className="hidden sm:block">
            Add Multiple
          </span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Add Multiple Transactions</AlertDialogTitle>
        </AlertDialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4">
          {fields.map((field, index) => (
            <TransactionRow
              key={field.id}
              index={index}
              control={form.control}
              remove={remove}
              wallets={wallets ?? []}
              budgets={budgets ?? []}
              portfolios={portfolios ?? []}
              watch={form.watch}
              setValue={form.setValue}
            />
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full mb-6 border-dashed"
            onClick={() =>
              append({
                name: "",
                date: getTodayDate(),
                amount: 0,
                type: "Expense",
                budget_id: undefined,
                wallet_id: undefined,
                transfer_id: undefined,
                portfolio_id: undefined,
                admin_fee: 0,
              })
            }
          >
            <IconPlus className="mr-2" size={18} />
            Add Another Row
          </Button>

          <AlertDialogFooter>
            <AlertDialogCancel type="button" className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <Button
              type="submit"
              disabled={mutation.isPending || fields.length === 0}
              className="cursor-pointer"
            >
              {mutation.isPending ? "Saving..." : "Save All"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
