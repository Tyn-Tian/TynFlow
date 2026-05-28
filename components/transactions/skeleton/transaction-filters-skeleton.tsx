import { Skeleton } from "@/components/ui/skeleton"

export function TransactionFiltersSkeleton() {
  return (
    <div className="flex items-end gap-2 my-4">
      <Skeleton className="h-10 w-full sm:w-[180px] rounded-md" />
      <Skeleton className="h-10 w-full sm:w-[180px] rounded-md" />
    </div>
  )
}
