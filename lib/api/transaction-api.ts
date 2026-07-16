import { Filters, Params, Transaction, TransactionDto } from "@/types/transaction-type";
import { apiClient } from "../apiClient";
import { BaseResponse } from "@/types/type";

export const transactionApi = {
    getAll: (params: Params = { page: 1, limit: 10 }) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.walletId) queryParams.append("walletId", params.walletId);
        if (params.budgetId) queryParams.append("budgetId", params.budgetId);

        return apiClient.get<BaseResponse<{ transactions: Transaction[], count: number }>>(`/transactions?${queryParams.toString()}`);
    },
    findTransactions: (filters: Filters) => {
        const queryParams = new URLSearchParams();
        if (filters.type) queryParams.append("type", filters.type);
        if (filters.startDate) queryParams.append("startDate", filters.startDate);
        if (filters.endDate) queryParams.append("endDate", filters.endDate);

        return apiClient.get<BaseResponse<Transaction[]>>(`/transactions/search?${queryParams.toString()}`);
    },
    exportExcel: (month: string, year: string) => apiClient.get<BaseResponse<Transaction[]>>(`/transactions/export?month=${month}&year=${year}`),
    getById: (id: string) => apiClient.get<BaseResponse<Transaction>>(`/transactions/${id}`),
    add: (dto: TransactionDto) => apiClient.post<BaseResponse<null>>("/transactions", dto),
    addMany: (dtos: TransactionDto[]) => apiClient.post<BaseResponse<null>>("/transactions/bulk", dtos),
    update: (id: string, dto: TransactionDto) => apiClient.put<BaseResponse<null>>(`/transactions/${id}`, dto),
    delete: (id: string) => apiClient.delete<BaseResponse<null>>(`/transactions/${id}`)
};
