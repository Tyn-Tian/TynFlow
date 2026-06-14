"use client";

import { columns } from "@/components/scheduler/columns";
import { DataTable } from "@/components/scheduler/data-table";
import { SiteHeader } from "@/components/site-header";
import { schedulerService } from "@/services/scheduler-service";
import { useQuery } from "@tanstack/react-query";

import { AddSchedulerDialog } from "@/components/scheduler/add-scheduler-dialog";

export default function Page() {
    const { data } = useQuery({
        queryKey: ["schedulers"],
        queryFn: async () => await schedulerService.getAll(),
    })

    return (
        <>
            <SiteHeader title="Transaction Scheduler" />
            <section className="p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="flex justify-end gap-2 mb-4">
                        <AddSchedulerDialog />
                    </div>
                    <DataTable columns={columns} data={data ?? []} />
                </div>
            </section>
        </>
    );
}