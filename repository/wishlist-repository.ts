import { getSupabase } from "@/lib/api";
import { WishlistDto } from "@/types/wishlist-type";

export const wishlistRepository = {
    getAll: async () => {
        const { supabase, userId } = await getSupabase();
        return supabase
            .from("wishlists")
            .select("id, user_id, created_at, name, priority, status, price")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });
    },
    add: async (data: WishlistDto) => {
        const { supabase, userId } = await getSupabase();
        return supabase
            .from("wishlists")
            .insert([{ ...data, user_id: userId }])
            .select();
    },
    delete: async (id: string) => {
        const { supabase, userId } = await getSupabase();
        return supabase
            .from("wishlists")
            .delete()
            .eq("id", id)
            .eq("user_id", userId);
    },
    update: async (id: string, data: WishlistDto) => {
        const { supabase, userId } = await getSupabase();
        return supabase
            .from("wishlists")
            .update(data)
            .eq("id", id)
            .eq("user_id", userId)
            .select();
    },
};
