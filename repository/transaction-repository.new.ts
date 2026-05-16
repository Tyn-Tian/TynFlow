import { getSupabase } from "@/lib/api";
import { Filters } from "@/types/transaction-type";

export const transactionRepository2 = {
  findTransactions: async (filters: Filters) => {
    const { supabase, userId } = await getSupabase();

    let query = supabase
      .from("transactions")
      .select(
        "id, name, date, amount, type, budget_id, wallet_id, transfer_id, admin_fee, portfolio_id",
      )
      .eq("user_id", userId);

    if (filters.type) {
      query = query.eq("type", filters.type);
    }
    if (filters.startDate) {
      query = query.gte("date", filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte("date", filters.endDate);
    }
    if (filters.walletId) {
      query = query.or(
        `wallet_id.eq.${filters.walletId},transfer_id.eq.${filters.walletId}`,
      );
    }
    if (filters.budgetId) {
      query = query.eq("budget_id", filters.budgetId);
    }
    if (filters.dates && filters.dates.length > 0) {
      query = query.in("date", filters.dates);
    }

    const { data } = await query.order("date", { ascending: false });
    return data || [];
  },
};
