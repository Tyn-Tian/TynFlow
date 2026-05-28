import { Skeleton } from "@/components/ui/skeleton"

export function TransactionPaginationSkeleton() {
  return (
    <div className="flex justify-end mt-6">
      <Skeleton className="h-10 w-72 rounded-md" />
    </div>
  )
}
