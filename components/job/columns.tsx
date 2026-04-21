"use client"

import * as React from "react"

import { ColumnDef } from "@tanstack/react-table"
import {
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
import { formatDate } from "@/lib/utils"
import { Job } from "../../repository/job-repository"
import { TableCellViewer } from "./table-cell-viewer"
import { DragHandle } from "./draggable-row"
import { DeleteJobDialog } from "./delete-job-dialog"

function ActionCell({ job }: { job: Job }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)

  return (
    <>
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
          <DropdownMenuItem>Make a copy</DropdownMenuItem>
          <DropdownMenuItem>Favorite</DropdownMenuItem>
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

      <DeleteJobDialog
        jobId={job.id}
        jobPosition={job.position}
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
      />
    </>
  )
}

export const columns: ColumnDef<Job>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    accessorKey: "position",
    header: "Position",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />
    },
    enableHiding: false,
  },
  {
    accessorKey: "company",
    header: "Company",
    cell: ({ row }) => {
      return <span>{row.original.company}</span>
    },
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="px-1.5 text-muted-foreground">
          {row.original.source}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className="px-1.5 text-muted-foreground">
        {row.original.status === "Accepted" ? (
          <IconCircleCheckFilled className="text-emerald-500" />
        ) : row.original.status === "Rejected" ? (
          <IconCircleX className="text-rose-500" />
        ) : (
          <IconLoader className="text-amber-500" />
        )}
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "applied_at",
    header: "Applied at",
    cell: ({ row }) => {
      return <span>{formatDate(row.original.applied_at)}</span>
    },
  },
  {
    accessorKey: "updated_at",
    header: "Updated at",
    cell: ({ row }) => {
      return <span>{formatDate(row.original.updated_at)}</span>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell job={row.original} />,
  },
]
