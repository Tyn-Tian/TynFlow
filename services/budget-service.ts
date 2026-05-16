import { budgetRepository } from "@/repository/budget-repository";
import { BudgetDto } from "@/types/budget-type";

export const budgetService = {
  getAll: async () => {
    const { data } = await budgetRepository.getAll();
    return data;
  },
  add: async (dto: BudgetDto) => {
    await budgetRepository.create(dto);
  },
  edit: async (id: string, dto: BudgetDto) => {
    await budgetRepository.update(id, dto);
  },
  delete: async (id: string) => {
    await budgetRepository.delete(id);
  },
};

// export async function getBudgets(supabase: SupabaseClient, userId: string) {
//   const { data: budgets, error } = await budgetRepository.getBudgetsByUserId(
//     supabase,
//     userId,
//   );
//   if (error) throw new Error(error.message);

//   const { data: profile } = await dashboardRepository.getDashboardDateRange(
//     supabase,
//     userId,
//   );
//   if (!profile) return budgets;

//   const startDate = profile.start_date;
//   const endDate = profile.end_date;
//   const today = new Date().toISOString().split("T")[0];
//   const dailyEnd = today < endDate ? today : endDate;

//   const start = new Date(startDate);
//   const end = new Date(dailyEnd);
//   const days = Math.max(
//     1,
//     Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
//   );

//   const enrichedBudgets = await Promise.all(
//     (budgets || []).map(async (b) => {
//       const { data: dailyTransactions } =
//         await transactionRepository.findTransactions(supabase, {
//           userId,
//           budgetId: b.id,
//           type: "Expense",
//           startDate,
//           endDate: dailyEnd,
//         });

//       const { data: realizationTransactions } =
//         await transactionRepository.findTransactions(supabase, {
//           userId,
//           budgetId: b.id,
//           type: "Expense",
//           startDate,
//           endDate,
//         });

//       const dailySum = (dailyTransactions || []).reduce(
//         (sum, tx) => sum + (Number(tx.amount) || 0),
//         0,
//       );
//       const realizationSum = (realizationTransactions || []).reduce(
//         (sum, tx) => sum + (Number(tx.amount) || 0),
//         0,
//       );

//       return {
//         ...b,
//         dailySpending: dailySum / days,
//         totalRealization: realizationSum,
//       };
//     }),
//   );

//   return enrichedBudgets;
// }

// export async function updateLeftover(
//   supabase: SupabaseClient,
//   id: string,
//   delta: number,
// ) {
//   const { data: bData, error: bErr } = await budgetRepository.getBudgetById(
//     supabase,
//     id,
//   );
//   if (bErr) throw new Error(bErr.message);

//   const currentLeftover = bData?.leftover ?? 0;
//   const newLeftover = Math.max(0, currentLeftover + delta);
//   const { error } = await budgetRepository.updateBudgetLeftover(
//     supabase,
//     id,
//     newLeftover,
//   );
//   if (error) throw new Error(error.message);
// }


