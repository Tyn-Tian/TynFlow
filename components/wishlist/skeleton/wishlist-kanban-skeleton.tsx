import { Skeleton } from "@/components/ui/skeleton";

export function KanbanSkeleton() {
    return (
        <div className="grid auto-rows-fr gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-3 rounded-lg border bg-card p-4">
                    <Skeleton className="h-6 w-24" />
                    <div className="flex flex-col gap-2">
                        {Array.from({ length: 2 }).map((_, cardIdx) => (
                            <Skeleton key={cardIdx} className="h-28 w-full rounded-xl" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}