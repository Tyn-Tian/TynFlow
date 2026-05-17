import { SiteHeader } from "@/components/site-header"
import { LiveList } from "@/components/live/live-list"
import { AddLiveDialog } from "../../../components/live/add-live-dialog"

export default async function Page() {
    return (
        <>
            <SiteHeader title="Live" />
            <section className="p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-4 flex justify-end">
                        <AddLiveDialog />
                    </div>
                    <LiveList />
                </div>
            </section>
        </>
    )
}
