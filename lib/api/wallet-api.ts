import { Wallet, WalletDto } from "@/types/wallet-type";

export const walletApi = {
    getAll: async (): Promise<Wallet[]> => {
        const res = await fetch("/api/wallets");
        if (!res.ok) {
            throw new Error("Failed to fetch wallets");
        }
        return res.json();
    },
    add: async (data: WalletDto) => {
        const res = await fetch("/api/wallets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            throw new Error("Failed to add wallet");
        }
        return res.json();
    },
    update: async (id: string, data: WalletDto) => {
        const res = await fetch(`/api/wallets/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            throw new Error("Failed to update wallet");
        }
        return res.json();
    },
    delete: async (id: string) => {
        const res = await fetch(`/api/wallets/${id}`, {
            method: "DELETE",
        });
        if (!res.ok) {
            throw new Error("Failed to delete wallet");
        }
        return res.json();
    }
};