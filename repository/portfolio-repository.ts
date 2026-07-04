import { getSupabase } from "@/lib/apiServer";
import { PortfolioDto } from "@/types/portfolio-type";

export const portfolioRepository = {
  getAll: async () => {
    const { supabase, userId } = await getSupabase();
    return supabase
      .from("portfolios")
      .select("id, name, type, target, invested, current_value")
      .eq("user_id", userId)
      .order("name", { ascending: true });
  },
  getById: async (id: string) => {
    const { supabase, userId } = await getSupabase();
    return supabase
      .from("portfolios")
      .select("id, name, type, target, invested, current_value, user_id")
      .eq("user_id", userId)
      .eq("id", id)
      .single();
  },
  create: async (dto: PortfolioDto) => {
    const { supabase, userId } = await getSupabase();
    return supabase.from("portfolios").insert({ ...dto, user_id: userId });
  },
  update: async (id: string, dto: PortfolioDto) => {
    const { supabase, userId } = await getSupabase();
    return supabase
      .from("portfolios")
      .update(dto)
      .eq("user_id", userId)
      .eq("id", id);
  },
  delete: async (id: string) => {
    const { supabase, userId } = await getSupabase();
    return supabase
      .from("portfolios")
      .delete()
      .eq("user_id", userId)
      .eq("id", id);
  },
  getSnapshots: async () => {
    const { supabase, userId } = await getSupabase();
    return supabase
      .from("portfolio_snapshots")
      .select("id, created_at, invested, current_value")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
  },
};
