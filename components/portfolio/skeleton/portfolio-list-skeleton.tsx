import { Skeleton } from "@/components/ui/skeleton"

export function PortfolioListSkeleton() {
  return (
    <>
      {/* Overview Card */}
      <Skeleton className="h-16 w-full rounded-xl mb-4" />
      
      {/* Grid of Portfolio Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-[180px] w-full rounded-xl" />
        <Skeleton className="h-[180px] w-full rounded-xl" />
        <Skeleton className="h-[180px] w-full rounded-xl" />
        <Skeleton className="h-[180px] w-full rounded-xl" />
      </div>
    </>
  )
}
