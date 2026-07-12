import { Wishlist, WishlistDto, WishlistParams } from "@/types/wishlist-type";
import { apiClient } from "../apiClient";
import { BaseResponse } from "@/types/type";

export const wishlistApi = {
    getAll: (params: WishlistParams = { page: 1, limit: 10 }) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.search) queryParams.append("search", params.search);
        if (params.priority) queryParams.append("priority", params.priority);
        if (params.status) queryParams.append("status", params.status);

        return apiClient.get<BaseResponse<{ wishlists: Wishlist[], count: number }>>(`/wishlists?${queryParams.toString()}`);
    },
    add: (data: WishlistDto) => apiClient.post<BaseResponse<null>>("/wishlists", data),
    update: (id: string, data: WishlistDto) => apiClient.put<BaseResponse<null>>(`/wishlists/${id}`, data),
    delete: (id: string) => apiClient.delete<BaseResponse<null>>(`/wishlists/${id}`),
};