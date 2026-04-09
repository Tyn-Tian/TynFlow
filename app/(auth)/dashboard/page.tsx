import { SectionCards } from "@/components/dashboard/section-cards"

import { SiteHeader } from "@/components/site-header"
import { ChartExpenses } from "@/components/dashboard/chart-expenses"
import { ChartIncome } from "@/components/dashboard/chart-income"

export default async function Page() {
  return (
    <>
      <SiteHeader title="Dashboard" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:py-6">
            <SectionCards />
            <div className="px-4 lg:px-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <ChartIncome />
              <ChartExpenses />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
