import { redirect } from "next/navigation"

import { PortfolioList } from "@/components/portfolio/portfolio-list"
import { AddPortfolioDialog } from "@/components/portfolio/add-portfolio-dialog"
import { SiteHeader } from "@/components/site-header"
import { createClient } from "@/lib/supabase/server"

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
            <SiteHeader title="Portfolio" />
            <section className="p-6">
                <div className="mx-auto max-w-7xl space-y-4">
                    <div className="col-span-3 flex justify-end">
                        <AddPortfolioDialog />
                    </div>
                    <PortfolioList />
                </div>
            </section>
        </>
    )
}
