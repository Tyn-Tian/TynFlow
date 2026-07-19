export type Priority = "Low" | "Medium" | "High";
export type Status = "Active" | "Achieved" | "Cancelled";

export interface Wishlist {
    id: string;
    user_id: string;
    created_at: string;
    name: string;
    priority: Priority;
    status: Status;
    price: number;
}

export type WishlistDto = {
    name: string;
    priority: "Low" | "Medium" | "High";
    status: "Active" | "Achieved" | "Cancelled";
    price: number;
};

export interface WishlistKanbanItem {
    id: string;
    name: string;
    priority: string;
    price: number;
    assignee: string;
    created_at: string;
    is_disabled: boolean;
}

export interface WishlistKanbanResponse {
    active: WishlistKanbanItem[];
    achieved: WishlistKanbanItem[];
    cancelled: WishlistKanbanItem[];
}

export interface WishlistParams {
    page?: number;
    limit?: number;
    search?: string;
    priority?: "Low" | "Medium" | "High";
    status?: "Active" | "Achieved" | "Cancelled";
}
