"use client";

import { SiteHeader } from "@/components/site-header";
import { TransactionList } from "@/components/transactions/transaction-list";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { AddMultipleTransactionDialog } from "@/components/transactions/add-multiple-transaction-dialog";
import { ExportTransactionDialog } from "@/components/transactions/export-transaction-dialog";

export default function Page() {
  return (
    <>
      <SiteHeader title="Transaction List" />
      <section className="p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="col-span-3 flex justify-end gap-2">
            <ExportTransactionDialog />
            <AddMultipleTransactionDialog />
            <AddTransactionDialog />
          </div>

          <TransactionList />
        </div>
      </section>
    </>
  );
}
