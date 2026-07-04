import { getSupabase } from "@/lib/apiServer";
import { LiveDto } from "@/types/live-type";

export type Live = {
  id?: string | number;
  date: string;
  type: "Lembur" | "Biasa";
  tiktok: number;
  shopee: number;
  user_id: string;
};

export const liveRepository = {
  getAll: async () => {
    const { supabase, userId } = await getSupabase();
    return supabase
      .from("lives")
      .select("id, date, type, tiktok, shopee, user_id")
      .eq("user_id", userId)
      .order("date", { ascending: false });
  },
  getById: async (id: string | number) => {
    const { supabase, userId } = await getSupabase();
    return supabase
      .from("lives")
      .select("id, date, type, tiktok, shopee, user_id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();
  },
  create: async (dto: LiveDto) => {
    const { supabase, userId } = await getSupabase();
    return supabase.from("lives").insert({
      ...dto,
      user_id: userId,
    });
  },
  update: async (id: string, dto: LiveDto) => {
    const { supabase, userId } = await getSupabase();
    return supabase
      .from("lives")
      .update(dto)
      .eq("id", id)
      .eq("user_id", userId);
  },
  delete: async (id: string) => {
    const { supabase, userId } = await getSupabase();
    return supabase.from("lives").delete().eq("id", id).eq("user_id", userId);
  },
};
