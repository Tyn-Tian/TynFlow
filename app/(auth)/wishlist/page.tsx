"use client";

import { DataTable } from "@/components/wishlist/table/data-table";
import { SiteHeader } from "@/components/site-header";
import { wishlistService } from "@/services/wishlist-service";
import { useQuery } from "@tanstack/react-query";

import { AddWishlistDialog } from "@/components/wishlist/add-wishlist-dialog";
import { columns } from "@/components/wishlist/table/columns";
import { WishlistTableSkeleton } from "@/components/wishlist/skeleton/wishlist-table-skeleton";

export default function Page() {
    const { data, isLoading } = useQuery({
        queryKey: ["wishlists"],
        queryFn: async () => await wishlistService.getAll(),
    });

    return (
        <>
            <SiteHeader title="Wishlist" />
            <section className="p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="flex justify-end gap-2 mb-4">
                        <AddWishlistDialog />
                    </div>
                    {isLoading ? (
                        <WishlistTableSkeleton />
                    ) : (
                        <DataTable columns={columns} data={data ?? []} />
                    )}
                </div>
            </section>
        </>
    );
}