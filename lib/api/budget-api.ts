import { BaseResponse } from './../../types/type';
import { Budget, BudgetDto } from "@/types/budget-type";
import { apiClient } from "../apiClient";

export const budgetApi = {
    getAll: (includeDeleted: boolean = false) => apiClient.get<BaseResponse<Budget[]>>(`/budgets?includeDeleted=${includeDeleted}`),
    getBudgets: async (startDate: string, endDate: string): Promise<any[]> => {
        const res = await fetch(`/api/budgets/enriched?startDate=${startDate}&endDate=${endDate}`);
        if (!res.ok) throw new Error("Failed to fetch enriched budgets");
        return res.json();
    },
    add: (data: BudgetDto) => apiClient.post<BaseResponse<null>>("/budgets", data),
    update: (id: string, data: BudgetDto) => apiClient.put<BaseResponse<null>>(`/budgets/${id}`, data),
    delete: (id: string) => apiClient.delete<BaseResponse<null>>(`/budgets/${id}`)
};
