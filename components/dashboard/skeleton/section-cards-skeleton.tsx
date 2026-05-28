import { Skeleton } from "@/components/ui/skeleton"

export function SectionCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 px-4 lg:px-6">
      <Skeleton className="h-[140px] w-full rounded-xl" />
      <Skeleton className="h-[140px] w-full rounded-xl" />
      <Skeleton className="h-[140px] w-full rounded-xl" />
    </div>
  )
}
