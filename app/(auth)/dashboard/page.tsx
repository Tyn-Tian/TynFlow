import { Suspense } from "react"
import { SectionCards } from "@/components/dashboard/section-cards"
import { SiteHeader } from "@/components/site-header"
import { ChartExpenses } from "@/components/dashboard/chart-expenses"
import { ChartIncome } from "@/components/dashboard/chart-income"
import { ChartBarTransactions } from "@/components/dashboard/chart-bar-transactions"
import { ChartWeeklyExpense } from "@/components/dashboard/chart-weekly-expense"
import { ChartPortfolioAllocation } from "@/components/dashboard/chart-portfolio-allocation"

import { DashboardFilter } from "@/components/dashboard/dashboard-filter"

export default async function Page() {
  return (
    <>
      <SiteHeader title="Dashboard" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:py-6">
            <div className="px-4 lg:px-6 flex justify-end">
              <Suspense>
                <DashboardFilter />
              </Suspense>
            </div>
            <Suspense>
              <SectionCards />
            </Suspense>
            <div className="px-4 lg:px-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Suspense>
                <ChartIncome />
              </Suspense>
              <Suspense>
                <ChartExpenses />
              </Suspense>
            </div>
            <div className="px-4 lg:px-6">
              <ChartBarTransactions />
            </div>
            <div className="px-4 lg:px-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <ChartWeeklyExpense />
              <ChartPortfolioAllocation />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
