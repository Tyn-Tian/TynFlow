import { Skeleton } from "@/components/ui/skeleton"

export function LiveListSkeleton() {
    return (
        <div className="space-y-6">
            {/* Mock one month group */}
            <div className="space-y-4">
                {/* Summary bar */}
                <Skeleton className="h-14 w-full rounded-xl" />
                
                {/* Cards grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Skeleton className="h-[90px] w-full rounded-xl" />
                    <Skeleton className="h-[90px] w-full rounded-xl" />
                    <Skeleton className="h-[90px] w-full rounded-xl" />
                    <Skeleton className="h-[90px] w-full rounded-xl" />
                </div>
            </div>

            {/* Mock second month group */}
            <div className="space-y-4">
                <Skeleton className="h-14 w-full rounded-xl" />
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Skeleton className="h-[90px] w-full rounded-xl" />
                    <Skeleton className="h-[90px] w-full rounded-xl" />
                </div>
            </div>
        </div>
    )
}
