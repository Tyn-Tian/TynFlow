"use client";

import { TransactionListSkeleton } from "@/components/transactions/skeleton/transaction-list-skeleton";

import { useState } from "react";
import { IconWallet, IconTrendingUp } from "@tabler/icons-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
} from "@/components/ui/pagination";
import useWallet from "@/hooks/use-wallet";
import useBudget from "@/hooks/use-budget";
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

import { Transaction } from "@/types/transaction-type";

export function TransactionList() {
  const [editTx, setEditTx] = useState<Transaction | null>(null);

  const [page, setPage] = useState(1);
  const [walletId, setWalletId] = useState<string>("all");
  const [budgetId, setBudgetId] = useState<string>("all");

  const { data: walletData } = useWallet();
  const { data: budgetData } = useBudget(true);

  const wallets = walletData?.data;
  const budgets = budgetData?.data;

  const { data: transactionsResponse, isLoading } = useQuery({
    queryKey: ["transactions", page, walletId, budgetId],
    queryFn: async () =>
      await transactionApi.getAll({
        page: page,
        limit: 10,
        walletId: walletId !== "all" ? walletId : undefined,
        budgetId: budgetId !== "all" ? budgetId : undefined,
      }),
  });

  const transactions = transactionsResponse?.data?.transactions;
  const pageCount = transactionsResponse?.data?.count ? Math.ceil(transactionsResponse.data.count / 10) : 1;

  if (isLoading || !transactions) return <TransactionListSkeleton />;

  if (transactions.length === 0)
    return (
      <div className="text-sm text-center text-muted-foreground">
        No transactions yet.
      </div>
    );

  const groups = transactions.reduce<Record<string, Transaction[]>>((acc, t) => {
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
      <div className="flex flex-wrap md:flex-nowrap items-center gap-2 mt-2 mb-4 w-full">
        <div className="w-full md:w-auto grid grid-cols-2 md:flex gap-2 items-center">
          <Select value={walletId} onValueChange={(val) => { setWalletId(val); setPage(1); }}>
            <SelectTrigger className="w-full md:w-[140px]">
              <SelectValue placeholder="All Wallets" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All Wallets</SelectItem>
              {wallets?.map((w) => (
                <SelectItem key={w.id} value={String(w.id)}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={budgetId} onValueChange={(val) => { setBudgetId(val); setPage(1); }}>
            <SelectTrigger className="w-full md:w-[140px]">
              <SelectValue placeholder="All Budgets" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All Budgets</SelectItem>
              {budgets?.map((b) => (
                <SelectItem key={b.id} value={String(b.id)} disabled={!!b.deleted_at}>
                  <span className="truncate max-w-[250px] sm:max-w-[500px] lg:max-w-full">
                    {b.name} {!!b.deleted_at ? "(Deleted)" : ""}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

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
                          ? (tx.wallet?.name ?? "-")
                          : tx.type === "Expense"
                            ? (tx.budget?.name ?? "-")
                            : tx.type === "Invest"
                              ? `${tx.wallet?.name ?? "-"} → ${tx.portfolio?.name ?? "-"}`
                              : `${tx.wallet?.name ?? "-"} → ${tx.transfer?.name ?? "-"}`}
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

      <div className="mt-4 flex">
          <Pagination className="sm:justify-end">
              <PaginationContent>
                  <PaginationItem>
                      <PaginationPrevious 
                          href="#" 
                          onClick={(e) => {
                              e.preventDefault();
                              if (page > 1) setPage(page - 1);
                          }}
                          className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                      />
                  </PaginationItem>
                  
                  {(() => {
                      let startPage = Math.max(1, page - 1);
                      let endPage = Math.min(pageCount, page + 1);

                      if (page === 1) {
                          endPage = Math.min(pageCount, 3);
                      } else if (page === pageCount) {
                          startPage = Math.max(1, pageCount - 2);
                      }

                      const pages = [];
                      for (let i = startPage; i <= endPage; i++) {
                          pages.push(i);
                      }

                      return pages.map((p) => (
                          <PaginationItem key={p}>
                              <PaginationLink 
                                  href="#"
                                  onClick={(e) => {
                                      e.preventDefault();
                                      setPage(p);
                                  }}
                                  isActive={p === page}
                              >
                                  {p}
                              </PaginationLink>
                          </PaginationItem>
                      ));
                  })()}

                  <PaginationItem>
                      <PaginationNext 
                          href="#" 
                          onClick={(e) => {
                              e.preventDefault();
                              if (page < pageCount) setPage(page + 1);
                          }}
                          className={page >= pageCount ? "pointer-events-none opacity-50" : ""}
                      />
                  </PaginationItem>
              </PaginationContent>
          </Pagination>
      </div>

      {editTx && (
        <EditTransactionDialog tx={editTx} onClose={() => setEditTx(null)} />
      )}
    </div>
  );
}
