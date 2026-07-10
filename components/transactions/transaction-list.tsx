"use client";

import { TransactionListSkeleton } from "@/components/transactions/skeleton/transaction-list-skeleton";

import { useState } from "react";
import { IconWallet, IconTrendingUp } from "@tabler/icons-react";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EditTransactionDialog } from "./edit-transaction-dialog";
import { useQuery } from "@tanstack/react-query";
import { transactionApi } from "@/lib/api/transaction-api";
import useWallet from "@/hooks/use-wallet";
import useBudget from "@/hooks/use-budget";
import usePortfolio from "@/hooks/use-portfolio";
import { useSearchParams } from "next/navigation";

type TxItem = {
  id: number | string;
  name: string;
  date: string;
  amount: number;
  budgetName?: string | null;
  walletName?: string | null;
  budget_id?: string | null;
  wallet_id?: string | null;
  transfer_id?: string | null;
  transferName?: string | null;
  portfolioName?: string | null;
  portfolio_id?: string | null;
  admin_fee?: number | null;
  type: "Income" | "Expense" | "Transfer" | "Invest";
};

export function TransactionList() {
  const [editTx, setEditTx] = useState<TxItem | null>(null);

  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const walletId = searchParams.get("walletId") ?? undefined;
  const budgetId = searchParams.get("budgetId") ?? undefined;

  const { data: walletData } = useWallet();
  const { data: budgetData } = useBudget(true);
  const { data: portfolios } = usePortfolio();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions", currentPage, walletId, budgetId],
    queryFn: async () =>
      await transactionApi.getPaginatedTransactions({
        wallets: walletData?.data ?? [],
        budgets: budgetData?.data ?? [],
        portfolios: portfolios ?? [],
        params: {
          page: currentPage,
          walletId,
          budgetId,
        },
      }),
    enabled:
      walletData !== undefined &&
      budgetData !== undefined &&
      portfolios !== undefined,
  });

  if (isLoading || !transactions) return <TransactionListSkeleton />;

  if (transactions.length === 0)
    return (
      <div className="text-sm text-center text-muted-foreground">
        No transactions yet.
      </div>
    );

  const groups = transactions.reduce<Record<string, TxItem[]>>((acc, t) => {
    const d = new Date(t.date);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
    (acc[dateKey] ??= []).push(t);
    return acc;
  }, {});

  const sortedDates = Object.keys(groups).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  const dailyTotals: Record<string, number> = Object.fromEntries(
    sortedDates.map((date) => [
      date,
      groups[date].reduce((acc, t) => {
        if (t.type === "Income") return acc + Math.abs(t.amount);
        if (t.type === "Expense") return acc - Math.abs(t.amount);
        return acc;
      }, 0),
    ]),
  );

  const getDailyTotalInfo = (date: string) => {
    const total = dailyTotals[date] ?? 0;
    return {
      total,
      isPositive: total > 0,
      isNegative: total < 0,
      formatted: Math.abs(total).toLocaleString("id-ID"),
    };
  };

  return (
    <div>
      {sortedDates.map((date) => (
        <div key={date} className="mb-6">
          <div className="flex justify-between items-center">
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
              {new Date(date).toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h3>
            <p
              className={`text-xs font-semibold ${getDailyTotalInfo(date).isPositive ? "text-emerald-500" : getDailyTotalInfo(date).isNegative ? "text-rose-500" : "text-muted-foreground"}`}
            >
              {getDailyTotalInfo(date).isPositive
                ? "+"
                : getDailyTotalInfo(date).isNegative
                  ? "-"
                  : ""}{" "}
              Rp {getDailyTotalInfo(date).formatted}
            </p>
          </div>
          <div className="space-y-3">
            {groups[date].map((tx) => (
              <Card
                key={tx.id}
                className="@container/card cursor-pointer transition-shadow hover:shadow-md gap-4 self-start py-4"
                onClick={() => setEditTx(tx)}
              >
                <CardHeader className="gap-0 flex items-center justify-between px-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-md ${tx.type === "Invest" ? "bg-blue-500/10" : "bg-emerald-500/10"}`}
                    >
                      {tx.type === "Invest" ? (
                        <IconTrendingUp size={20} className="text-blue-400" />
                      ) : (
                        <IconWallet size={20} className="text-emerald-400" />
                      )}
                    </span>
                    <div className="flex flex-col">
                      <CardTitle>{tx.name}</CardTitle>
                      <CardDescription>
                        {tx.type === "Income"
                          ? (tx.walletName ?? "-")
                          : tx.type === "Expense"
                            ? (tx.budgetName ?? "-")
                            : tx.type === "Invest"
                              ? `${tx.walletName ?? "-"} → ${tx.portfolioName ?? "-"}`
                              : `${tx.walletName ?? "-"} → ${tx.transferName ?? "-"}`}
                      </CardDescription>
                    </div>
                  </div>
                  <CardAction className="self-center text-sm font-bold tabular-nums">
                    {tx.type === "Income" ? "+" : "-"} Rp{" "}
                    {Math.abs(tx.amount).toLocaleString("id-ID")}
                  </CardAction>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {editTx && (
        <EditTransactionDialog tx={editTx} onClose={() => setEditTx(null)} />
      )}
    </div>
  );
}
