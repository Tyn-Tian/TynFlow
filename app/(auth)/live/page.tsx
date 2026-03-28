import { SiteHeader } from "@/components/site-header"
import { LiveList } from "@/components/live/live-list"
import { normalizeLiveItems } from "@/components/live/live-data"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AddLiveDialog } from "../../../components/live/add-live-dialog"

export default async function Page() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data } = await supabase
        .from("lives")
        .select("id, date, type, sales")
        .eq("user_id", user.id)
        .order("date", { ascending: false })

    const lives = normalizeLiveItems(data ?? [])

    return (
        <>
            <SiteHeader title="Live" />
            <section className="p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-4 flex justify-end">
                        <AddLiveDialog />
                    </div>
                    <LiveList lives={lives} />
                </div>
            </section>
        </>
    )
}
