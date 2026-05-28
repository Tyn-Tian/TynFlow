import { Skeleton } from "@/components/ui/skeleton"

export function TransactionListSkeleton() {
  return (
    <div className="flex flex-col gap-4 mb-8 w-full">
      <Skeleton className="h-24 w-full rounded-md" />
      <Skeleton className="h-24 w-full rounded-md" />
      <Skeleton className="h-24 w-full rounded-md" />
      <Skeleton className="h-24 w-full rounded-md" />
      <Skeleton className="h-24 w-full rounded-md" />
    </div>
  )
}
