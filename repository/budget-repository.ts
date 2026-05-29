import { getSupabase } from "@/lib/api";
import { BudgetDto } from "@/types/budget-type";

export const budgetRepository = {
  getAll: async (includeDeleted: boolean = false) => {
    const { supabase, userId } = await getSupabase();

    let query = supabase
      .from("budgets")
      .select("id, name, total, leftover, deleted_at")
      .eq("user_id", userId)
      .order("name", { ascending: true });

    if (!includeDeleted) {
      query = query.is("deleted_at", null);
    }

    return query;
  },
  getById: async (id: string) => {
    const { supabase, userId } = await getSupabase();
    return supabase
      .from("budgets")
      .select("id, name, total, leftover")
      .eq("user_id", userId)
      .eq("id", id)
      .single();
  },
  create: async (dto: BudgetDto) => {
    const { supabase, userId } = await getSupabase();
    return supabase.from("budgets").insert({
      name: dto.name,
      total: dto.total,
      leftover: dto.leftover,
      user_id: userId,
    });
  },
  update: async (id: string, dto: BudgetDto) => {
    const { supabase, userId } = await getSupabase();
    return supabase
      .from("budgets")
      .update({
        name: dto.name,
        total: dto.total,
        leftover: dto.leftover,
      })
      .eq("user_id", userId)
      .eq("id", id);
  },
  delete: async (id: string) => {
    const { supabase, userId } = await getSupabase();
    return supabase.from("budgets")
      .update({ deleted_at: new Date().toISOString() })
      .eq("user_id", userId).eq("id", id);
  },
};
