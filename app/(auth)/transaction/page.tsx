"use client";

import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { TransactionList } from "@/components/transactions/transaction-list";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { ExportTransactionDialog } from "@/components/transactions/export-transaction-dialog";
import { TransactionPaginationNav } from "@/components/transactions/transaction-pagination-nav";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { transactionService } from "@/services/transaction-service";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { IconLoader } from "@tabler/icons-react";

function TransactionContent() {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const walletId = searchParams.get("walletId") ?? undefined;
  const budgetId = searchParams.get("budgetId") ?? undefined;

  const { data: metadata = { totalPages: 1 } } = useQuery({
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
        <AddTransactionDialog />
      </div>

      <TransactionFilters />
      <TransactionList />

      <TransactionPaginationNav
        totalPages={metadata.totalPages}
        currentPage={currentPage}
      />
    </div>
  );
}

export default function Page() {
  return (
    <>
      <SiteHeader title="Transaction" />
      <section className="p-6">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <IconLoader className="size-5 animate-spin" />
            </div>
          }
        >
          <TransactionContent />
        </Suspense>
      </section>
    </>
  );
}
