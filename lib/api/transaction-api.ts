import { Filters, Params, Transaction, TransactionDto } from "@/types/transaction-type";
import { Wallet } from "@/types/wallet-type";
import { Budget } from "@/types/budget-type";
import { Portfolio } from "@/types/portfolio-type";

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
    getById: async (id: string): Promise<Transaction> => {
        const res = await fetch(`/api/transactions/${id}`);
        if (!res.ok) throw new Error("Failed to fetch transaction");
        return res.json();
    },
    add: async (data: TransactionDto) => {
        const res = await fetch("/api/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to add transaction");
        return res.json();
    },
    addMany: async (data: TransactionDto[]) => {
        const res = await fetch("/api/transactions/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to add multiple transactions");
        return res.json();
    },
    update: async (id: string, data: TransactionDto) => {
        const res = await fetch(`/api/transactions/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update transaction");
        return res.json();
    },
    delete: async (id: string) => {
        const res = await fetch(`/api/transactions/${id}`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete transaction");
        return res.json();
    }
};
