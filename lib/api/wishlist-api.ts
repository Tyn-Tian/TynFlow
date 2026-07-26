import { WishlistResponse, WishlistDto } from "@/types/wishlist-type";
import { apiClient } from "../apiClient";
import { BaseResponse } from "@/types/type";

export const wishlistApi = {
    getAll: (page: number = 1, limit: number = 10, search?: string, status?: string, priority?: string, assignee?: string) => {
        let url = `/wishlists?page=${page}&limit=${limit}`;
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }
        if (status && status !== "all") {
            url += `&status=${encodeURIComponent(status)}`;
        }
        if (priority && priority !== "all") {
            url += `&priority=${encodeURIComponent(priority)}`;
        }
        if (assignee && assignee !== "all") {
            url += `&assignee=${encodeURIComponent(assignee)}`;
        }
        return apiClient.get<BaseResponse<WishlistResponse>>(url);
    },
    add: (data: WishlistDto) => apiClient.post<BaseResponse<null>>("/wishlists", data),
    update: (id: string, data: WishlistDto) => apiClient.put<BaseResponse<null>>(`/wishlists/${id}`, data),
    change: (id: string, status: string) => apiClient.patch<BaseResponse<null>>(`/wishlists/${id}`, { status }),
    delete: (id: string) => apiClient.delete<BaseResponse<null>>(`/wishlists/${id}`),
};