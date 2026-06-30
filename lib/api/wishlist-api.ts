import { Wishlist, WishlistDto } from "@/types/wishlist-type";

export const wishlistApi = {
    getAll: async (): Promise<Wishlist[]> => {
        const res = await fetch("/api/wishlists");
        if (!res.ok) {
            throw new Error("Failed to fetch wishlists");
        }
        return res.json();
    },
    add: async (data: WishlistDto) => {
        const res = await fetch("/api/wishlists", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            throw new Error("Failed to add wishlist");
        }
        return res.json();
    },
    update: async (id: string, data: WishlistDto) => {
        const res = await fetch(`/api/wishlists/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            throw new Error("Failed to update wishlist");
        }
        return res.json();
    },
    delete: async (id: string) => {
        const res = await fetch(`/api/wishlists/${id}`, {
            method: "DELETE",
        });
        if (!res.ok) {
            throw new Error("Failed to delete wishlist");
        }
        return res.json();
    }
};