import { getSupabase } from "@/lib/apiServer";
import { WishlistDto } from "@/types/wishlist-type";

export const wishlistRepository = {
    getAll: async (page: number = 1, limit: number = 10) => {
        const { supabase, userId } = await getSupabase();
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        return supabase
            .from("wishlists")
            .select("id, user_id, created_at, name, priority, status, price", { count: "exact" })
            .eq("user_id", userId)
            .order("priority", { ascending: true })
            .order("price", { ascending: true })
            .range(from, to);
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
