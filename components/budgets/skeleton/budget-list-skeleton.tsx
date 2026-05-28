import { Skeleton } from "@/components/ui/skeleton"

export function BudgetListSkeleton() {
  return (
    <>
      <Skeleton className="h-16 w-full rounded-xl mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4">
        <Skeleton className="h-[120px] w-full rounded-xl" />
        <Skeleton className="h-[120px] w-full rounded-xl" />
        <Skeleton className="h-[120px] w-full rounded-xl" />
        <Skeleton className="h-[120px] w-full rounded-xl" />
      </div>
    </>
  )
}
