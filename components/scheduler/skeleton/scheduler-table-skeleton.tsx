import { Skeleton } from "@/components/ui/skeleton";

export function SchedulerTableSkeleton() {
  return (
    <div className="rounded-md border w-full">
      <Skeleton className="w-full h-44" />
    </div>
  )
}
