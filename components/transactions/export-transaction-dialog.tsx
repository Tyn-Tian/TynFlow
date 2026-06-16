"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { IconDownload } from "@tabler/icons-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import * as XLSX from "xlsx";

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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
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
import { useMutation } from "@tanstack/react-query";
import { transactionService } from "@/services/transaction-service";
import { Wallet } from "@/types/wallet-type";
import { Budget } from "@/types/budget-type";
import { Portfolio } from "@/types/portfolio-type";

export function ExportTransactionDialog() {
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    format(new Date(), "yyyy-MM"),
  );

  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(new Date(), i);
    return {
      label: format(d, "MMMM yyyy"),
      value: format(d, "yyyy-MM"),
      startDate: format(startOfMonth(d), "yyyy-MM-dd"),
      endDate: format(endOfMonth(d), "yyyy-MM-dd"),
    };
  });

  const { data: wallets } = useWallet();
  const { data: budgets } = useBudget();
  const { data: portfolios } = usePortfolio();

  const mutation = useMutation({
    mutationFn: async ({
      wallets,
      budgets,
      portfolios,
      filters,
    }: {
      wallets: Wallet[];
      budgets: Budget[];
      portfolios: Portfolio[];
      filters: { startDate?: string; endDate?: string };
    }) =>
      await transactionService.exportExcel({
        wallets,
        budgets,
        portfolios,
        filters,
      }),
    onSuccess: (data) => {
      if (data.length === 0) {
        toast.info("No transactions found for the selected period.");
        return;
      }

      const exportData = data.map((t) => ({
        Name: t.name,
        Date: format(new Date(t.date), "dd-MM-yyyy"),
        Amount: t.amount,
        Type: t.type,
        Budget: t.budgetName || "-",
        Wallet: t.walletName || "-",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
      XLSX.writeFile(workbook, `Transactions_${selectedMonth}.xlsx`);

      toast.success("Success", {
        description: "Transactions exported successfully.",
      });
      setOpen(false);
    },
    onError: (err: Error | unknown) => {
      toast.error("Failed", {
        description: err instanceof Error ? err.message : "Unexpected error.",
      });
    },
  });

  const handleExport = async () => {
    const monthData = months.find((m) => m.value === selectedMonth);
    if (!monthData) {
      toast.error("Invalid month selected");
      return;
    }

    if (!wallets || !budgets || !portfolios) {
      toast.error("Data is still loading, please wait.");
      return;
    }

    mutation.mutate({
      wallets,
      budgets,
      portfolios,
      filters: {
        startDate: monthData.startDate,
        endDate: monthData.endDate,
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button className="cursor-pointer">
          <IconDownload />
          <span className="hidden sm:block">
            Export
          </span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Export Transactions</AlertDialogTitle>
        </AlertDialogHeader>

        <FieldGroup className="gap-6 my-4">
          <Field>
            <FieldLabel>Select Month</FieldLabel>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>

        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <Button
            onClick={handleExport}
            disabled={mutation.isPending || !wallets || !budgets || !portfolios}
            className="cursor-pointer"
          >
            {mutation.isPending ? "Exporting..." : "Export to Excel"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
