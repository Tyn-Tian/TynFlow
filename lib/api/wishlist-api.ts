import { WishlistKanbanResponse, WishlistDto } from "@/types/wishlist-type";
import { apiClient } from "../apiClient";
import { BaseResponse } from "@/types/type";

export const wishlistApi = {
    getAll: () => apiClient.get<BaseResponse<WishlistKanbanResponse>>(`/wishlists`),
    add: (data: WishlistDto) => apiClient.post<BaseResponse<null>>("/wishlists", data),
    update: (id: string, data: WishlistDto) => apiClient.put<BaseResponse<null>>(`/wishlists/${id}`, data),
    change: (id: string, status: string) => apiClient.patch<BaseResponse<null>>(`/wishlists/${id}`, { status }),
    delete: (id: string) => apiClient.delete<BaseResponse<null>>(`/wishlists/${id}`),
};