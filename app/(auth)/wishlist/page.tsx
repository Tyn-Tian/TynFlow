"use client";

import { SiteHeader } from "@/components/site-header";

import { AddWishlistDialog } from "@/components/wishlist/add-wishlist-dialog";
import { WishlistKanban } from "@/components/wishlist/wishlist-kanban";

export default function Page() {
    return (
        <>
            <SiteHeader title="Wishlist" />
            <section className="p-4 md:p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-wrap md:flex-nowrap items-center gap-2 mb-4 w-full">
                        <div className="order-2 md:order-3 md:ml-auto">
                            <AddWishlistDialog />
                        </div>
                    </div>
                    <WishlistKanban />
                </div>
            </section>
        </>
    );
}