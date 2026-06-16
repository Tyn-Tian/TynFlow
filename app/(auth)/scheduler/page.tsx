"use client";

import { DataTable } from "@/components/scheduler/table/data-table";
import { SiteHeader } from "@/components/site-header";
import { schedulerService } from "@/services/scheduler-service";
import { useQuery } from "@tanstack/react-query";

import { AddSchedulerDialog } from "@/components/scheduler/add-scheduler-dialog";
import { columns } from "@/components/scheduler/table/columns";
import { SchedulerTableSkeleton } from "@/components/scheduler/skeleton/scheduler-table-skeleton";

export default function Page() {
    const { data, isLoading } = useQuery({
        queryKey: ["schedulers"],
        queryFn: async () => await schedulerService.getAll(),
    })

    return (
        <>
            <SiteHeader title="Transaction Scheduler" />
            <section className="p-4 md:p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="flex justify-end gap-2 mb-4">
                        <AddSchedulerDialog />
                    </div>
                    {isLoading ? (
                        <SchedulerTableSkeleton />
                    ) : (
                        <DataTable columns={columns} data={data ?? []} />
                    )}
                </div>
            </section>
        </>
    );
}