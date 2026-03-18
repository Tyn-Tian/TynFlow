import { SiteHeader } from "@/components/site-header"
import { AddBudgetDialog } from "@/components/budgets/add-budget-dialog"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BudgetList } from "@/components/budgets/budget-list"

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
            <SiteHeader title="Budget" />
            <section className="p-6">
                <div className="mx-auto max-w-7xl space-y-4">
                    <div className="col-span-3 flex justify-end">
                        <AddBudgetDialog />
                    </div>

                    <BudgetList />
                </div>
            </section>
        </>
    )
}
