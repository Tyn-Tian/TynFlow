"use client"

import { formatDate, formatRupiah } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { Scheduler } from "@/types/scheduler-type"
import { Badge } from "@/components/ui/badge"
import { ActionCell } from "./action-cell"
import { IconCircleCheckFilled, IconCircleX } from "@tabler/icons-react"

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
                <Badge variant="outline" className="px-1.5 text-muted-foreground">
                    {status === "Active" ? (
                        <IconCircleCheckFilled className="text-emerald-500" />
                    ) : (
                        <IconCircleX className="text-rose-500" />
                    )}
                    {status}
                </Badge>
            )
        }
    },
    {
        id: "actions",
        header: () => <div className="text-right"></div>,
        cell: ({ row }) => <ActionCell scheduler={row.original} />
    }
]