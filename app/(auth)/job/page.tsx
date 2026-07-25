import { SiteHeader } from "@/components/site-header"
import { DataTable } from "@/components/job/data-table"

export default async function Page() {
    return (
        <>
            <SiteHeader title="Job" />
            <section className="p-6">
                <DataTable />
            </section>
        </>
    )
}
