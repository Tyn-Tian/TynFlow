export interface Wishlist {
    id: string;
    user_id: string;
    created_at: string;
    name: string;
    priority: "Low" | "Medium" | "High";
    status: "Active" | "Achieved" | "Cancelled";
    price: number;
}

export type WishlistDto = {
    name: string;
    priority: "Low" | "Medium" | "High";
    status: "Active" | "Achieved" | "Cancelled";
    price: number;
};
