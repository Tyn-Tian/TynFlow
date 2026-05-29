import { budgetRepository } from "@/repository/budget-repository";
import { transactionRepository } from "@/repository/transaction-repository";
import { BudgetDto } from "@/types/budget-type";

export const budgetService = {
  getAll: async (includeDeleted: boolean = false) => {
    const { data } = await budgetRepository.getAll(includeDeleted);
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
  updateLeftover: async (id: string, delta: number) => {
    const { data } = await budgetRepository.getById(id);
    const currentLeftover = data?.leftover ?? 0;
    const newLeftover = currentLeftover + delta;

    await budgetRepository.update(id, {
      name: data?.name,
      total: data?.total,
      leftover: newLeftover,
    });
  },
  getBudgets: async (startDate: string, endDate: string) => {
    const { data: budgets } = await budgetRepository.getAll();

    const today = new Date().toISOString().split("T")[0];
    const dailyEnd = today < endDate ? today : endDate;

    const start = new Date(startDate);
    const end = new Date(dailyEnd);
    const days = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    );

    const enrichedBudgets = await Promise.all(
      (budgets || []).map(async (b) => {
        const dailyTransactions = await transactionRepository.findTransactions({
          budgetId: b.id,
          type: "Expense",
          startDate,
          endDate: dailyEnd
        });

        const realizationTransactions = await transactionRepository.findTransactions({
          budgetId: b.id,
          type: "Expense",
          startDate,
          endDate
        });

        const dailySum = (dailyTransactions || []).reduce(
          (sum, tx) => sum + (Number(tx.amount) || 0),
          0,
        );

        const realizationSum = (realizationTransactions || []).reduce(
          (sum, tx) => sum + (Number(tx.amount) || 0),
          0,
        );

        return {
          ...b,
          dailySpending: dailySum / days,
          totalRealization: realizationSum
        };
      })
    );

    return enrichedBudgets;
  }
};
