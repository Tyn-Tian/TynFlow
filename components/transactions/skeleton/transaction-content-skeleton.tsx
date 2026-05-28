import { Skeleton } from "@/components/ui/skeleton"

export function TransactionContentSkeleton() {
  return (
    <div className="mx-auto max-w-7xl">
      {/* Top action buttons */}
      <div className="col-span-3 flex justify-end gap-2 mb-6">
        <Skeleton className="h-10 w-32 rounded-md" />
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>

      {/* Filters area */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Skeleton className="h-10 w-full md:w-1/3 rounded-md" />
        <Skeleton className="h-10 w-full md:w-1/4 rounded-md" />
        <Skeleton className="h-10 w-full md:w-1/4 rounded-md" />
      </div>

      {/* List / Table rows */}
      <div className="flex flex-col gap-4 mb-8">
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6">
        <Skeleton className="h-10 w-72 rounded-md" />
      </div>
    </div>
  )
}
