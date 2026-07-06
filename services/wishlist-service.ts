import { wishlistRepository } from "@/repository/wishlist-repository";
import { WishlistDto } from "@/types/wishlist-type";

export const wishlistService = {
    getAll: async (page: number = 1, limit: number = 10) => {
        const { data, count, error } = await wishlistRepository.getAll(page, limit);
        if (error) {
            throw new Error(error.message);
        }
        return { data: data ?? [], count: count ?? 0 };
    },
    add: async (data: WishlistDto) => {
        const { error, data: result } = await wishlistRepository.add(data);
        if (error) {
            throw new Error(error.message);
        }
        return result;
    },
    delete: async (id: string) => {
        const { error, data: result } = await wishlistRepository.delete(id);
        if (error) {
            throw new Error(error.message);
        }
        return result;
    },
    update: async (id: string, data: WishlistDto) => {
        const { error, data: result } = await wishlistRepository.update(id, data);
        if (error) {
            throw new Error(error.message);
        }
        return result;
    },
};
