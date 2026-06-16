"use client"

import { formatDate, formatRupiah } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { Wishlist } from "@/types/wishlist-type"
import { Badge } from "@/components/ui/badge"
import { ActionCell } from "./action-cell"
import { IconArrowBadgeDown, IconArrowBadgeRight, IconArrowBadgeUp, IconCircleCheckFilled, IconCircleX, IconLoader } from "@tabler/icons-react"

export const columns: ColumnDef<Wishlist>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => {
            const priority = row.getValue("priority") as string;
            return (
                <Badge variant="outline" className="px-1.5 text-muted-foreground">
                    {priority === "High" ? (
                        <IconArrowBadgeUp className="text-rose-700" />
                    ) : priority === "Medium" ? (
                        <IconArrowBadgeRight className="text-amber-500" />
                    ) : (
                        <IconArrowBadgeDown className="text-emerald-500" />
                    )}
                    {priority}
                </Badge>
            )
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
                        <IconLoader className="text-amber-500" />
                    ) : status === "Achieved" ? (
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
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => {
            const price = row.getValue("price") as number;
            return formatRupiah(price)
        },
    },
    {
        accessorKey: "created_at",
        header: "Create Date",
        cell: ({ row }) => {
            const createdAt = row.getValue("created_at") as string;
            return formatDate(createdAt);
        }
    },
    {
        id: "actions",
        header: () => <div className="text-right"></div>,
        cell: ({ row }) => <ActionCell wishlist={row.original} />
    }
]
