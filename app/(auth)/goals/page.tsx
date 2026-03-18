import { SiteHeader } from "@/components/site-header"
import { AddGoalDialog } from "@/components/goals/add-goal-dialog"
import { IconTarget } from "@tabler/icons-react"
import { GoalList } from "@/components/goals/goal-list"

export default function Page() {
    return (
        <>
            <SiteHeader title="Goals" />
            <section className="p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="col-span-3 rounded-xl border bg-card px-4 py-3">
                        <div className="flex items-center justify-between gap-2 text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex size-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <IconTarget className="size-4" />
                                </span>
                                <div>
                                    <p className="text-sm font-medium">Manage Goals</p>
                                    <p className="text-xs text-muted-foreground">Set your financial targets</p>
                                </div>
                            </div>
                            <AddGoalDialog />
                        </div>
                    </div>

                    <div className="mt-4">
                        <GoalList />
                    </div>
                </div>
            </section>
        </>
    )
}
