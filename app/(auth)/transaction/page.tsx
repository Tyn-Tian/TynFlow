import { SiteHeader } from "@/components/site-header"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TransactionList } from "@/components/transactions/transaction-list"
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog"

type TransactionRow = {
    id: string
    name: string
    date: string
    amount: number
    budget_id?: string | null
    budgets?: { name?: string } | { name?: string }[] | null
    wallet_id?: string | null
    wallets?: { name?: string } | { name?: string }[] | null
    type: "Income" | "Expense"
}

type Transaction = {
    id: string
    name: string
    date: string
    amount: number
    budgetName?: string
    walletName?: string
    type: "Income" | "Expense"
}

export default async function Page() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: txData } = await supabase
        .from("transactions")
        .select("id, name, date, amount, type, budget_id, budgets(name), wallet_id, wallets(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    const transactions: Transaction[] = (txData ?? []).map((t: TransactionRow) => ({
        id: t.id,
        name: t.name,
        date: t.date,
        amount: t.amount,
        budgetName: t.budgets ? (Array.isArray(t.budgets) ? t.budgets[0]?.name : t.budgets?.name) : undefined,
        walletName: t.wallets ? (Array.isArray(t.wallets) ? t.wallets[0]?.name : t.wallets?.name) : undefined,
        type: t.type
    }))

    return (
        <>
            <SiteHeader title="Transaction" />
            <section className="p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="col-span-3 flex justify-end mb-4">
                        <AddTransactionDialog />
                    </div>
                    <TransactionList transactions={transactions} />
                </div>
            </section>
        </>
    )
}
