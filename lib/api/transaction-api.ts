import { Filters, Params, Transaction, TransactionDto } from "@/types/transaction-type";
import { Wallet } from "@/types/wallet-type";
import { Budget } from "@/types/budget-type";
import { Portfolio } from "@/types/portfolio-type";
import { apiClient } from "../apiClient";
import { BaseResponse } from "@/types/type";

export const transactionApi = {
    findTransactions: async (filters: Filters): Promise<Transaction[]> => {
        const res = await fetch("/api/transactions/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "findTransactions", filters }),
        });
        if (!res.ok) throw new Error("Failed to fetch transactions");
        return res.json();
    },
    getPaginatedTransactions: async (payload: {
        wallets: Wallet[];
        budgets: Budget[];
        portfolios: Portfolio[];
        params: Params;
    }): Promise<any[]> => {
        const res = await fetch("/api/transactions/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "getPaginatedTransactions", ...payload }),
        });
        if (!res.ok) throw new Error("Failed to fetch paginated transactions");
        return res.json();
    },
    getTransactionPaginationMetadata: async (params: Params): Promise<{ totalPages: number }> => {
        const res = await fetch("/api/transactions/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "getTransactionPaginationMetadata", params }),
        });
        if (!res.ok) throw new Error("Failed to fetch transaction metadata");
        return res.json();
    },
    exportExcel: async (payload: {
        wallets: Wallet[];
        budgets: Budget[];
        portfolios: Portfolio[];
        filters: { startDate?: string; endDate?: string };
    }): Promise<any[]> => {
        const res = await fetch("/api/transactions/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "exportExcel", ...payload }),
        });
        if (!res.ok) throw new Error("Failed to export transactions");
        return res.json();
    },
    getById: (id: string) => apiClient.get<BaseResponse<Transaction>>(`/transactions/${id}`),
    add: (dto: TransactionDto) => apiClient.post<BaseResponse<null>>("/transactions", dto),
    addMany: (dtos: TransactionDto[]) => apiClient.post<BaseResponse<null>>("/transactions/bulk", dtos),
    update: (id: string, dto: TransactionDto) => apiClient.put<BaseResponse<null>>(`/transactions/${id}`, dto),
    delete: (id: string) => apiClient.delete<BaseResponse<null>>(`/transactions/${id}`)
};
