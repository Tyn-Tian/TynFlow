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
    transfer_id?: string | null
    transfer_wallets?: { name?: string } | { name?: string }[] | null
    type: "Income" | "Expense" | "Transfer"
}

type Transaction = {
    id: string
    name: string
    date: string
    amount: number
    budgetName?: string
    walletName?: string
    transferName?: string
    budget_id?: string | null
    wallet_id?: string | null
    transfer_id?: string | null
    type: "Income" | "Expense" | "Transfer"
}

export default async function Page() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: txData, error: txError } = await supabase
        .from("transactions")
        .select("id, name, date, amount, type, budget_id, wallet_id, transfer_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    if (txError) {
        console.error("Failed to load transactions:", txError)
    }

    const rows: TransactionRow[] = (txData ?? []) as TransactionRow[]

    const walletIds = Array.from(
        new Set(rows.flatMap((r) => [r.wallet_id, r.transfer_id].filter(Boolean) as string[]))
    )

    let walletMap: Record<string, string> = {}
    if (walletIds.length) {
        const { data: walletsData, error: walletsError } = await supabase
            .from("wallets")
            .select("id, name")
            .in("id", walletIds)

        if (walletsError) console.error("Failed to load wallets:", walletsError)
        if (walletsData) walletMap = Object.fromEntries((walletsData as { id: string; name?: string }[]).map((w) => [w.id, w.name ?? ""]))
    }

    const budgetIds = Array.from(new Set(rows.map((r) => r.budget_id).filter(Boolean) as string[]))
    let budgetMap: Record<string, string> = {}
    if (budgetIds.length) {
        const { data: budgetsData, error: budgetsError } = await supabase
            .from("budgets")
            .select("id, name")
            .in("id", budgetIds)

        if (budgetsError) console.error("Failed to load budgets:", budgetsError)
        if (budgetsData) budgetMap = Object.fromEntries((budgetsData as { id: string; name?: string }[]).map((b) => [b.id, b.name ?? ""]))
    }

    const transactions: Transaction[] = rows.map((t) => ({
        id: t.id,
        name: t.name,
        date: t.date,
        amount: t.amount,
        budgetName: t.budget_id ? budgetMap[t.budget_id] : undefined,
        walletName: t.wallet_id ? walletMap[t.wallet_id] : undefined,
        transferName: t.transfer_id ? walletMap[t.transfer_id] : undefined,
        budget_id: t.budget_id ?? undefined,
        wallet_id: t.wallet_id ?? undefined,
        transfer_id: t.transfer_id ?? undefined,
        type: t.type as "Income" | "Expense" | "Transfer",
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
