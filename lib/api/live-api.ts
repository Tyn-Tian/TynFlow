import { Live, LiveDto } from "@/types/live-type";

export const liveApi = {
    getAll: async (): Promise<Live[]> => {
        const res = await fetch("/api/lives");
        if (!res.ok) throw new Error("Failed to fetch lives");
        return res.json();
    },
    getById: async (id: string): Promise<Live> => {
        const res = await fetch(`/api/lives/${id}`);
        if (!res.ok) throw new Error("Failed to fetch live");
        return res.json();
    },
    add: async (data: LiveDto) => {
        const res = await fetch("/api/lives", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to add live");
        return res.json();
    },
    update: async (id: string, data: LiveDto) => {
        const res = await fetch(`/api/lives/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update live");
        return res.json();
    },
    delete: async (id: string) => {
        const res = await fetch(`/api/lives/${id}`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete live");
        return res.json();
    }
};
