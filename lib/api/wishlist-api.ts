import { Wishlist, WishlistDto } from "@/types/wishlist-type";
import { apiClient } from "../apiClient";
import { BaseResponse } from "@/types/type";

export const wishlistApi = {
    getAll: (page: number = 1, limit: number = 10) => apiClient.get<BaseResponse<{ wishlists: Wishlist[], count: number }>>(`/wishlists?page=${page}&limit=${limit}`),
    add: (data: WishlistDto) => apiClient.post<BaseResponse<null>>("/wishlists", data),
    update: (id: string, data: WishlistDto) => apiClient.put<BaseResponse<null>>(`/wishlists/${id}`, data),
    delete: (id: string) => apiClient.delete<BaseResponse<null>>(`/wishlists/${id}`),
};