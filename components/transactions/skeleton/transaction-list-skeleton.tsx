import { Skeleton } from "@/components/ui/skeleton"

export function TransactionListSkeleton() {
  return (
    <div className="w-full">
      <div className="flex flex-wrap md:flex-nowrap items-center gap-2 mt-2 mb-4 w-full">
        <div className="w-full md:w-auto grid grid-cols-2 md:flex gap-2 items-center">
          <Skeleton className="h-10 w-full md:w-[140px] rounded-md" />
          <Skeleton className="h-10 w-full md:w-[140px] rounded-md" />
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-4 w-full">
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>

      <div className="flex sm:justify-end">
        <Skeleton className="h-10 w-full sm:w-[300px] rounded-md" />
      </div>
    </div>
  )
}
