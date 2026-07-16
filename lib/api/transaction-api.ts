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
    findTransactions: async (filters: Filters): Promise<Transaction[]> => {
        const res = await fetch("/api/transactions/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "findTransactions", filters }),
        });
        if (!res.ok) throw new Error("Failed to fetch transactions");
        return res.json();
    },
    exportExcel: (month: string, year: string) => apiClient.get<BaseResponse<Transaction[]>>(`/transactions/export?month=${month}&year=${year}`),
    getById: (id: string) => apiClient.get<BaseResponse<Transaction>>(`/transactions/${id}`),
    add: (dto: TransactionDto) => apiClient.post<BaseResponse<null>>("/transactions", dto),
    addMany: (dtos: TransactionDto[]) => apiClient.post<BaseResponse<null>>("/transactions/bulk", dtos),
    update: (id: string, dto: TransactionDto) => apiClient.put<BaseResponse<null>>(`/transactions/${id}`, dto),
    delete: (id: string) => apiClient.delete<BaseResponse<null>>(`/transactions/${id}`)
};
