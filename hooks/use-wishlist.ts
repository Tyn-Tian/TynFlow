import { wishlistApi } from "@/lib/api/wishlist-api";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { WishlistDto } from "@/types/wishlist-type";

export function useWishlists(
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string,
  priority?: string,
  assignee?: string
) {
  return useQuery({
    queryKey: ["wishlists", page, limit, search, status, priority, assignee],
    queryFn: async () => {
      const response = await wishlistApi.getAll(page, limit, search, status, priority, assignee);
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useAddWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: WishlistDto) => await wishlistApi.add(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlists"] });
    },
  });
}

export function useUpdateWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: WishlistDto }) =>
      await wishlistApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlists"] });
    },
  });
}

export function useDeleteWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => await wishlistApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlists"] });
    },
  });
}
