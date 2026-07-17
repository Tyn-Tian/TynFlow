import { BaseResponse } from './../../types/type';
import { Budget, BudgetDto } from "@/types/budget-type";
import { apiClient } from "../apiClient";

export const budgetApi = {
    getAll: () => apiClient.get<BaseResponse<Budget[]>>("/budgets"),
    getOptions: (includeDeleted: boolean = false) => apiClient.get<BaseResponse<Budget[]>>(`/budgets/options?includeDeleted=${includeDeleted}`),
    add: (data: BudgetDto) => apiClient.post<BaseResponse<null>>("/budgets", data),
    update: (id: string, data: BudgetDto) => apiClient.put<BaseResponse<null>>(`/budgets/${id}`, data),
    delete: (id: string) => apiClient.delete<BaseResponse<null>>(`/budgets/${id}`)
};
