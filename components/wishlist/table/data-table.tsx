"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
    PaginationLink,
} from "@/components/ui/pagination"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    page?: number
    pageCount?: number
    onPageChange?: (page: number) => void
}

export function DataTable<TData, TValue>({
    columns,
    data,
    page,
    pageCount,
    onPageChange,
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div>
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader className="sticky top-0 z-10 bg-muted">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
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
                    <TableBody className="**:data-[slot=table-cell]:first:w-8">
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {page !== undefined && pageCount !== undefined && onPageChange && (
                <div className="mt-4 flex">
                    <Pagination className="sm:justify-end">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious 
                                    href="#" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (page > 1) onPageChange(page - 1);
                                    }}
                                    className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>
                            
                            {(() => {
                                let startPage = Math.max(1, page - 1);
                                let endPage = Math.min(pageCount, page + 1);

                                if (page === 1) {
                                    endPage = Math.min(pageCount, 3);
                                } else if (page === pageCount) {
                                    startPage = Math.max(1, pageCount - 2);
                                }

                                const pages = [];
                                for (let i = startPage; i <= endPage; i++) {
                                    pages.push(i);
                                }

                                return pages.map((p) => (
                                    <PaginationItem key={p}>
                                        <PaginationLink 
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                onPageChange(p);
                                            }}
                                            isActive={p === page}
                                        >
                                            {p}
                                        </PaginationLink>
                                    </PaginationItem>
                                ));
                            })()}

                            <PaginationItem>
                                <PaginationNext 
                                    href="#" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (page < pageCount) onPageChange(page + 1);
                                    }}
                                    className={page >= pageCount ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    )
}
