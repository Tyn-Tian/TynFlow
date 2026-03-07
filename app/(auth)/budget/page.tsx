import { SiteHeader } from "@/components/site-header"
import { AddBudgetDialog } from "@/components/budgets/add-budget-dialog"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { IconCalendarDollar } from "@tabler/icons-react"
import { BudgetList } from "@/components/budgets/budget-list"

export default async function Page() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data } = await supabase
        .from("budgets")
        .select("id, name, total, leftover")
        .eq("user_id", user.id)
        .order("name", { ascending: true })

    const budgets = data ?? []

    return (
        <>
            <SiteHeader title="Budget" />
            <section className="p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-3 gap-4 items-start">
                        <div className="col-span-3 flex justify-end">
                            <AddBudgetDialog />
                        </div>
                        <div className="col-span-3 flex items-center justify-between rounded-xl border bg-card px-4 py-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <span className="inline-flex size-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <IconCalendarDollar className="size-4" />
                                </span>
                                <div>
                                    <p className="text-sm font-medium">Monthly Budget</p>
                                    <p className="text-xs text-muted-foreground">March 2026</p>
                                </div>
                            </div>
                            <p className="text-sm font-bold tabular-nums text-foreground">
                                Rp {budgets.reduce((total, b) => total + b.leftover, 0).toLocaleString("id-ID")}
                            </p>
                        </div>

                        <BudgetList budgets={budgets} />
                    </div>
                </div>
            </section>
        </>
    )
}
