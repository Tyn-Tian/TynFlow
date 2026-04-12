import { SiteHeader } from "@/components/site-header"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TransactionList } from "@/components/transactions/transaction-list"
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog"
import { TransactionFilters } from "@/components/transactions/transaction-filters"
import { TransactionPaginationNav } from "@/components/transactions/transaction-pagination-nav"
import { getPaginatedTransactionsAction } from "@/actions/transaction-actions"
import { getWalletsAction } from "@/actions/wallet-actions"
import { getBudgetsAction } from "@/actions/budget-actions"

interface PageProps {
    searchParams: Promise<{
        page?: string
        walletId?: string
        budgetId?: string
    }>
}

export default async function Page({ searchParams }: PageProps) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const walletId = params.walletId
    const budgetId = params.budgetId

    const [
        { data: transactions, metadata },
        wallets,
        budgets
    ] = await Promise.all([
        getPaginatedTransactionsAction({ page: currentPage, walletId, budgetId }),
        getWalletsAction(),
        getBudgetsAction()
    ])

    return (
        <>
            <SiteHeader title="Transaction" />
            <section className="p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="col-span-3 flex justify-end">
                        <AddTransactionDialog />
                    </div>

                    <TransactionFilters wallets={wallets} budgets={budgets} />
                    <TransactionList initialTransactions={transactions as any} />

                    <TransactionPaginationNav
                        totalPages={metadata.totalPages}
                        currentPage={currentPage}
                    />
                </div>
            </section>
        </>
    )
}
