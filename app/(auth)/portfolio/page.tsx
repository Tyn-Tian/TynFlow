import { PortfolioList } from "@/components/portfolio/portfolio-list"
import { AddPortfolioDialog } from "@/components/portfolio/add-portfolio-dialog"
import { SiteHeader } from "@/components/site-header"
import PortfolioOverviewChart from "@/components/portfolio/portfolio-overview-chart"

export default async function Page() {
    return (
        <>
            <SiteHeader title="Portfolio" />
            <section className="p-6">
                <div className="mx-auto max-w-7xl space-y-4">
                    <div className="col-span-3 flex justify-end">
                        <AddPortfolioDialog />
                    </div>
                    <PortfolioOverviewChart />
                    <PortfolioList />
                </div>
            </section>
        </>
    )
}
