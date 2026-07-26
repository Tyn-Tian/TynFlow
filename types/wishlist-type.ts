export type Priority = "low" | "medium" | "high";
export type Status = "Active" | "Achieved" | "Cancelled";

export interface Wishlist {
    id: string;
    user_id: string;
    created_at: string;
    name: string;
    priority: Priority;
    status: Status;
    price: number;
    assignee?: string;
    is_disabled?: boolean;
}

export type WishlistDto = {
    name: string;
    priority: "Low" | "Medium" | "High";
    status: "Active" | "Achieved" | "Cancelled";
    price: number;
};

export interface WishlistResponse {
    wishlists: Wishlist[];
    count: number;
}

export interface WishlistParams {
    page?: number;
    limit?: number;
    search?: string;
    priority?: "low" | "medium" | "high" | "Low" | "Medium" | "High";
    status?: "Active" | "Achieved" | "Cancelled" | "active" | "achieved" | "cancelled";
    assignee?: string;
}
