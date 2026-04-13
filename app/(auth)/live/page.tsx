import * as liveService from "@/services/live-service"
import { SiteHeader } from "@/components/site-header"
import { LiveList } from "@/components/live/live-list"
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

    const lives = await liveService.getLives(supabase, user.id)

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
