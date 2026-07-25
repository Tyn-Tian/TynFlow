import { SiteHeader } from "@/components/site-header";
import { AddWishlistDialog } from "@/components/wishlist/add-wishlist-dialog";
import { WishlistKanban } from "@/components/wishlist/wishlist-kanban";
import { Suspense } from "react";
import { KanbanSkeleton } from "@/components/wishlist/skeleton/wishlist-kanban-skeleton";

export default async function Page() {
    return (
        <>
            <SiteHeader title="Wishlist" />
            <section className="p-4 md:p-6">
                <div className="mx-auto max-w-7xl space-y-4">
                    <div className="flex justify-end">
                        <AddWishlistDialog />
                    </div>
                    <Suspense fallback={<KanbanSkeleton />}>
                        <WishlistKanban />
                    </Suspense>
                </div>
            </section>
        </>
    );
}