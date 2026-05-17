import { getSupabase } from "@/lib/api";
import { WalletDto } from "@/types/wallet-type";

export const walletRepository = {
  getAll: async () => {
    const { supabase, userId } = await getSupabase();
    return supabase
      .from("wallets")
      .select("id, name, type, balance")
      .eq("user_id", userId)
      .order("name", { ascending: true });
  },
  getById: async (id: string) => {
    const { supabase, userId } = await getSupabase();
    return supabase
      .from("wallets")
      .select("id, name, type, balance")
      .eq("id", id)
      .eq("user_id", userId)
      .single();
  },
  create: async (dto: WalletDto) => {
    const { supabase, userId } = await getSupabase();
    return supabase.from("wallets").insert({
      name: dto.name,
      type: dto.type,
      balance: dto.balance,
      user_id: userId,
    });
  },
  update: async (id: string, dto: WalletDto) => {
    const { supabase, userId } = await getSupabase();
    return supabase
      .from("wallets")
      .update({
        name: dto.name,
        type: dto.type,
        balance: dto.balance,
      })
      .eq("id", id)
      .eq("user_id", userId);
  },
  delete: async (id: string) => {
    const { supabase, userId } = await getSupabase();
    return supabase.from("wallets").delete().eq("id", id).eq("user_id", userId);
  },
};
