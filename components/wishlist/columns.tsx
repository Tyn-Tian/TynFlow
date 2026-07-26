"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import {
  IconArrowBadgeDown,
  IconArrowBadgeRight,
  IconArrowBadgeUp,
  IconCircleCheckFilled,
  IconCircleX,
  IconDotsVertical,
  IconLoader,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatRupiah, formatDate } from "@/lib/utils"
import { EditWishlistDialog } from "./edit-wishlist-dialog"
import { DeleteWishlistDialog } from "./delete-wishlist-dialog"
import { Wishlist } from "@/types/wishlist-type"

function ActionCell({ wishlist }: { wishlist: Wishlist }) {
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)

  if (wishlist.is_disabled) {
    return null
  }

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            className="cursor-pointer text-rose-500!"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditWishlistDialog
        wishlist={wishlist}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <DeleteWishlistDialog
        wishlist={wishlist}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  )
}

export const columns: ColumnDef<Wishlist>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <span className="font-medium text-foreground">{row.original.name}</span>
    },
    enableHiding: false,
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      return (
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          {formatRupiah(row.original.price)}
        </span>
      )
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.original.priority?.toLowerCase() || ""
      return (
        <Badge variant="outline" className="px-1.5 text-muted-foreground">
          {priority === "high" ? (
            <IconArrowBadgeUp className="text-rose-700 size-4 mr-0.5" />
          ) : priority === "medium" ? (
            <IconArrowBadgeRight className="text-amber-500 size-4 mr-0.5" />
          ) : (
            <IconArrowBadgeDown className="text-emerald-500 size-4 mr-0.5" />
          )}
          {priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : "-"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge variant="outline" className="px-1.5 text-muted-foreground">
          {status === "Achieved" ? (
            <IconCircleCheckFilled className="text-emerald-500 size-4 mr-1" />
          ) : status === "Cancelled" ? (
            <IconCircleX className="text-rose-500 size-4 mr-1" />
          ) : (
            <IconLoader className="text-amber-500 size-4 mr-1" />
          )}
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "assignee",
    header: "Assignee",
    cell: ({ row }) => {
      const assignee = row.original.assignee
      return (
        <div className="flex items-center gap-1.5">
          {assignee ? (
            <>
              <div className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-medium text-primary uppercase">
                {assignee.charAt(0)}
              </div>
              <span className="line-clamp-1 text-sm">{assignee}</span>
            </>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: "Created at",
    cell: ({ row }) => {
      return <span className="text-sm">{formatDate(row.original.created_at)}</span>
    },
  },
  {
    id: "actions",
    header: () => <span className="text-right"></span>,
    cell: ({ row }) => <ActionCell wishlist={row.original} />,
  },
]
