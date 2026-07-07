import { SiteHeader } from "@/components/site-header"
import { LiveList } from "@/components/live/live-list"
import { AddLiveDialog } from "../../../components/live/add-live-dialog"
import { LiveMonthFilter } from "@/components/live/live-month-filter"
import { Suspense } from "react"

export default async function Page() {
    return (
        <>
            <SiteHeader title="Live" />
            <section className="p-4 md:p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-4 flex items-center justify-end gap-3">
                        <Suspense fallback={<div className="h-9 w-[180px] animate-pulse rounded-md bg-muted"></div>}>
                            <LiveMonthFilter />
                        </Suspense>
                        <AddLiveDialog />
                    </div>
                    <Suspense fallback={<div>Loading live data...</div>}>
                        <LiveList />
                    </Suspense>
                </div>
            </section>
        </>
    )
}
