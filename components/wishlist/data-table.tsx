"use client"

import * as React from "react"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconSearch,
} from "@tabler/icons-react"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { columns } from "./columns"
import { AddWishlistDialog } from "./add-wishlist-dialog"
import { WishlistTableSkeleton } from "./skeleton/wishlist-table-skeleton"
import { useWishlists } from "@/hooks/use-wishlist"
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group"

export function DataTable() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [priorityFilter, setPriorityFilter] = React.useState("all")
  const [assigneeFilter, setAssigneeFilter] = React.useState("all")

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: response, isLoading } = useWishlists(
    1,
    100,
    debouncedSearch,
    statusFilter,
    priorityFilter,
    assigneeFilter
  )

  const initialData = React.useMemo(() => response?.wishlists || [], [response?.wishlists])
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const table = useReactTable({
    data: initialData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  if (isLoading) {
    return <WishlistTableSkeleton />
  }

  return (
    <div className="w-full flex flex-col justify-start gap-2 sm:gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center w-full sm:w-auto flex-1">
          <InputGroup className="w-full sm:w-72">
            <InputGroupAddon align="inline-start">
              <IconSearch className="text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              type="text"
              placeholder="Search wishlist name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>

          <div className="grid grid-cols-3 gap-2 w-full sm:flex sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContentSideWrapper>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="achieved">Achieved</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContentSideWrapper>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContentSideWrapper>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContentSideWrapper>
            </Select>

            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Assignee" />
              </SelectTrigger>
              <SelectContentSideWrapper>
                <SelectItem value="all">All Assignee</SelectItem>
                <SelectItem value="d4e69f3b-c49e-4b65-ad03-50f6cb803571">Christian</SelectItem>
                <SelectItem value="8017eb2d-1c88-4e83-ba13-80ce15477154">Puji debora</SelectItem>
              </SelectContentSideWrapper>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-end w-full sm:w-auto">
          <AddWishlistDialog />
        </div>
      </div>

      <div className="relative flex flex-col gap-4 overflow-auto">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="h-12"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end px-4">
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SelectContentSideWrapper({ children }: { children: React.ReactNode }) {
  return <SelectContent>{children}</SelectContent>
}
