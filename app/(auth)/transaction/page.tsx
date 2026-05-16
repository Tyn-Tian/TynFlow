import { SiteHeader } from "@/components/site-header"
import { TransactionList } from "@/components/transactions/transaction-list"
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog"
import { ExportTransactionDialog } from "@/components/transactions/export-transaction-dialog"
import { TransactionFilters } from "@/components/transactions/transaction-filters"
import { TransactionPaginationNav } from "@/components/transactions/transaction-pagination-nav"
import { getPaginatedTransactionsAction } from "@/actions/transaction-actions"

interface PageProps {
    searchParams: Promise<{
        page?: string
        walletId?: string
        budgetId?: string
    }>
}

export default async function Page({ searchParams }: PageProps) {
    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const walletId = params.walletId
    const budgetId = params.budgetId

    const [
        { data: transactions, metadata },
    ] = await Promise.all([
        getPaginatedTransactionsAction({ page: currentPage, walletId, budgetId }),
    ])

    return (
        <>
            <SiteHeader title="Transaction" />
            <section className="p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="col-span-3 flex justify-end gap-2">
                        <ExportTransactionDialog />
                        <AddTransactionDialog />
                    </div>

                    {/* <TransactionFilters budgets={budgets} /> */}
                    <TransactionList initialTransactions={transactions} />

                    <TransactionPaginationNav
                        totalPages={metadata.totalPages}
                        currentPage={currentPage}
                    />
                </div>
            </section>
        </>
    )
}
