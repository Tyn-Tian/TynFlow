import { Budget, BudgetDto } from "@/types/budget-type";

export const budgetApi = {
    getAll: async (includeDeleted: boolean = false): Promise<Budget[]> => {
        const res = await fetch(`/api/budgets?includeDeleted=${includeDeleted}`);
        if (!res.ok) throw new Error("Failed to fetch budgets");
        return res.json();
    },
    getBudgets: async (startDate: string, endDate: string): Promise<any[]> => {
        const res = await fetch(`/api/budgets/enriched?startDate=${startDate}&endDate=${endDate}`);
        if (!res.ok) throw new Error("Failed to fetch enriched budgets");
        return res.json();
    },
    add: async (data: BudgetDto) => {
        const res = await fetch("/api/budgets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to add budget");
        return res.json();
    },
    update: async (id: string, data: BudgetDto) => {
        const res = await fetch(`/api/budgets/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update budget");
        return res.json();
    },
    delete: async (id: string) => {
        const res = await fetch(`/api/budgets/${id}`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete budget");
        return res.json();
    }
};
