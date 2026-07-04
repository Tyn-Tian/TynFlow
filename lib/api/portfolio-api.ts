import { Portfolio, PortfolioDto, PortfolioSnapshot } from "@/types/portfolio-type";

export const portfolioApi = {
    getAll: async (): Promise<Portfolio[]> => {
        const res = await fetch("/api/portfolios");
        if (!res.ok) throw new Error("Failed to fetch portfolios");
        return res.json();
    },
    getSnapshots: async (): Promise<PortfolioSnapshot[]> => {
        const res = await fetch("/api/portfolios/snapshots");
        if (!res.ok) throw new Error("Failed to fetch portfolio snapshots");
        return res.json();
    },
    add: async (data: PortfolioDto) => {
        const res = await fetch("/api/portfolios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to add portfolio");
        return res.json();
    },
    update: async (id: string, data: PortfolioDto) => {
        const res = await fetch(`/api/portfolios/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update portfolio");
        return res.json();
    },
    delete: async (id: string) => {
        const res = await fetch(`/api/portfolios/${id}`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete portfolio");
        return res.json();
    }
};
