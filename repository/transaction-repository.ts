import { getSupabase } from "@/lib/api";
import { Filters, TransactionDto } from "@/types/transaction-type";

export const transactionRepository = {
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
  findTransactionDates: async (filters: {
    walletId?: string;
    budgetId?: string;
  }) => {
    const { supabase, userId } = await getSupabase();

    let query = supabase
      .from("transactions")
      .select("date")
      .eq("user_id", userId);

    if (filters.walletId) {
      query = query.or(
        `wallet_id.eq.${filters.walletId},transfer_id.eq.${filters.walletId}`,
      );
    }
    if (filters.budgetId) {
      query = query.eq("budget_id", filters.budgetId);
    }

    return query.order("date", { ascending: false });
  },
  findEarliestTransactionDate: async () => {
    const { supabase, userId } = await getSupabase();
    return supabase
      .from("transactions")
      .select("date")
      .eq("user_id", userId)
      .order("date", { ascending: true })
      .limit(1)
      .single();
  },
  getById: async (id: string) => {
    const { supabase, userId } = await getSupabase();
    return supabase
      .from("transactions")
      .select(
        "id, name, date, amount, type, budget_id, wallet_id, transfer_id, admin_fee, portfolio_id",
      )
      .eq("user_id", userId)
      .eq("id", id)
      .single();
  },
  create: async (transaction: TransactionDto) => {
    const { supabase, userId } = await getSupabase();
    return supabase
      .from("transactions")
      .insert({ ...transaction, user_id: userId });
  },
  update: async (id: string, transaction: TransactionDto) => {
    const { supabase, userId } = await getSupabase();
    return supabase
      .from("transactions")
      .update({ ...transaction, user_id: userId })
      .eq("id", id)
      .eq("user_id", userId);
  },
  delete: async (id: string) => {
    const { supabase, userId } = await getSupabase();
    return supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
  },
};
