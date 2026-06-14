"use client"

import { cn, formatDate, formatRupiah } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "../ui/badge"
import { Scheduler } from "@/types/scheduler-type"

export const columns: ColumnDef<Scheduler>[] = [
    {
        accessorKey: "name",
        header: "Name"
    },
    {
        accessorKey: "type",
        header: "Type",
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
            const amount = row.getValue("amount") as number;
            return formatRupiah(amount)
        },
    },
    {
        accessorKey: "frequency",
        header: "Frequency",
    },
    {
        accessorKey: "next_run_date",
        header: "Next Run Date",
        cell: ({ row }) => {
            const nextRunDate = row.getValue("next_run_date") as string;
            return formatDate(nextRunDate);
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;

            return (
                <Badge className={cn(
                    status === "Active" && "bg-emerald-100 text-emerald-700",
                    status === "Inactive" && "bg-rose-100 text-rose-700",
                )}>
                    {status}
                </Badge>
            )
        }
    },
]