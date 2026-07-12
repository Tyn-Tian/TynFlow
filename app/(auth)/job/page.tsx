import { SiteHeader } from "@/components/site-header"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

import { DataTable } from "@/components/job/data-table"

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
            <SiteHeader title="Job" />
            <section className="p-6">
                <DataTable />
            </section>
        </>
    )
}
