import { Scheduler, SchedulerDto } from "@/types/scheduler-type";

export const schedulerApi = {
    getAll: async (): Promise<Scheduler[]> => {
        const res = await fetch("/api/schedulers");
        if (!res.ok) throw new Error("Failed to fetch schedulers");
        return res.json();
    },
    add: async (data: SchedulerDto) => {
        const res = await fetch("/api/schedulers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to add scheduler");
        return res.json();
    },
    update: async (id: string, data: SchedulerDto) => {
        const res = await fetch(`/api/schedulers/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update scheduler");
        return res.json();
    },
    delete: async (id: string) => {
        const res = await fetch(`/api/schedulers/${id}`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete scheduler");
        return res.json();
    },
    activate: async (id: string) => {
        const res = await fetch(`/api/schedulers/${id}/activate`, {
            method: "POST",
        });
        if (!res.ok) throw new Error("Failed to activate scheduler");
        return res.json();
    },
    deactivate: async (id: string) => {
        const res = await fetch(`/api/schedulers/${id}/deactivate`, {
            method: "POST",
        });
        if (!res.ok) throw new Error("Failed to deactivate scheduler");
        return res.json();
    }
};
