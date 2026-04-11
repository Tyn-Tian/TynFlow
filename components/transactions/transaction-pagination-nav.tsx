"use client"

import { useSearchParams } from "next/navigation"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface TransactionPaginationNavProps {
  totalPages: number
  currentPage: number
}

export function TransactionPaginationNav({ totalPages, currentPage }: TransactionPaginationNavProps) {
  const searchParams = useSearchParams()

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    return `?${params.toString()}`
  }

  if (totalPages <= 1) return null

  return (
    <div className="mt-4 flex">
      <Pagination className="sm:justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href={createPageUrl(Math.max(1, currentPage - 1))}
              aria-disabled={currentPage <= 1}
              className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {(() => {
            let startPage = Math.max(1, currentPage - 1)
            let endPage = Math.min(totalPages, currentPage + 1)

            if (currentPage === 1) {
              endPage = Math.min(totalPages, 3)
            } else if (currentPage === totalPages) {
              startPage = Math.max(1, totalPages - 2)
            }

            const pages = []
            for (let i = startPage; i <= endPage; i++) {
              pages.push(i)
            }

            return pages.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink 
                  href={createPageUrl(page)} 
                  isActive={page === currentPage}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))
          })()}

          <PaginationItem>
            <PaginationNext 
              href={createPageUrl(Math.min(totalPages, currentPage + 1))}
              aria-disabled={currentPage >= totalPages}
              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
