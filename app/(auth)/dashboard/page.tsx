import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"

import data from "../data.json"
import { SiteHeader } from "@/components/site-header"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"

export default function Page() {
  return (
    <>
      <SiteHeader title="Dashboard" />
      <div className="min-h-screen flex items-center justify-center p-6">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Coming Soon</EmptyTitle>
            <EmptyDescription>
              We are working hard to bring you this feature. Stay tuned!
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
      {/* <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <DataTable data={data} />
          </div>
        </div>
      </div> */}
    </>
  )
}
