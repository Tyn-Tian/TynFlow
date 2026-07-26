import { SiteHeader } from "@/components/site-header";
import { DataTable } from "@/components/wishlist/data-table";
import { Suspense } from "react";
import { WishlistTableSkeleton } from "@/components/wishlist/skeleton/wishlist-table-skeleton";

export default async function Page() {
    return (
        <>
            <SiteHeader title="Wishlist" />
            <section className="p-4 md:p-6">
                <div className="mx-auto max-w-7xl space-y-4">
                    <Suspense fallback={<WishlistTableSkeleton />}>
                        <DataTable />
                    </Suspense>
                </div>
            </section>
        </>
    );
}