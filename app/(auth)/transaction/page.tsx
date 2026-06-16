"use client";

import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { TransactionList } from "@/components/transactions/transaction-list";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { AddMultipleTransactionDialog } from "@/components/transactions/add-multiple-transaction-dialog";
import { ExportTransactionDialog } from "@/components/transactions/export-transaction-dialog";
import { TransactionPaginationNav } from "@/components/transactions/transaction-pagination-nav";
import { TransactionPaginationSkeleton } from "@/components/transactions/skeleton/transaction-pagination-skeleton";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { transactionService } from "@/services/transaction-service";
import { TransactionFilters } from "@/components/transactions/transaction-filters";

function TransactionContent() {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const walletId = searchParams.get("walletId") ?? undefined;
  const budgetId = searchParams.get("budgetId") ?? undefined;

  const { data: metadata = { totalPages: 1 }, isLoading } = useQuery({
    queryKey: ["transactions", "metadata", currentPage, walletId, budgetId],
    queryFn: async () =>
      await transactionService.getTransactionPaginationMetadata({
        page: currentPage,
        walletId,
        budgetId,
      }),
  });

  return (
    <div className="mx-auto max-w-7xl">
      <div className="col-span-3 flex justify-end gap-2">
        <ExportTransactionDialog />
        <AddMultipleTransactionDialog />
        <AddTransactionDialog />
      </div>

      <TransactionFilters />
      <TransactionList />

      {isLoading ? (
        <TransactionPaginationSkeleton />
      ) : (
        <TransactionPaginationNav
          totalPages={metadata.totalPages}
          currentPage={currentPage}
        />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <>
      <SiteHeader title="Transaction List" />
      <section className="p-4 md:p-6">
        <Suspense fallback={<div />}>
          <TransactionContent />
        </Suspense>
      </section>
    </>
  );
}
