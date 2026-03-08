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
}

type Transaction = {
    id: string
    name: string
    date: string
    amount: number
    budgetName?: string
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
        .select("id, name, date, amount, budget_id, budgets(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    const transactions: Transaction[] = (txData ?? []).map((t: TransactionRow) => ({
        id: t.id,
        name: t.name,
        date: t.date,
        amount: t.amount,
        budgetName: t.budgets ? (Array.isArray(t.budgets) ? t.budgets[0]?.name : t.budgets?.name) : undefined,
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
