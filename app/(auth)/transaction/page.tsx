import { SiteHeader } from "@/components/site-header"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TransactionList } from "@/components/transactions/transaction-list"
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog"

export default async function Page() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    return (
        <>
            <SiteHeader title="Transaction" />
            <section className="p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="col-span-3 flex justify-end mb-4">
                        <AddTransactionDialog />
                    </div>
                    <TransactionList />
                </div>
            </section>
        </>
    )
}
