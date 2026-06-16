import { wishlistRepository } from "@/repository/wishlist-repository";
import { WishlistDto } from "@/types/wishlist-type";

export const wishlistService = {
    getAll: async () => {
        const { data } = await wishlistRepository.getAll();
        return data ?? [];
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
