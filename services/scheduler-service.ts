import { schedulerRepository } from "@/repository/scheduler-repository";
import { SchedulerDto } from "@/types/scheduler-type";

export const schedulerService = {
    getAll: async () => {
        const { data } = await schedulerRepository.getAll();
        return data ?? [];
    },
    add: async (data: SchedulerDto) => {
        const { error, data: result } = await schedulerRepository.add(data);
        if (error) {
            throw new Error(error.message);
        }
        return result;
    },
    deactivate: async (id: string) => {
        const { error, data: result } = await schedulerRepository.deactivate(id);
        if (error) {
            throw new Error(error.message);
        }
        return result;
    },
    activate: async (id: string) => {
        const { error, data: result } = await schedulerRepository.activate(id);
        if (error) {
            throw new Error(error.message);
        }
        return result;
    },
    delete: async (id: string) => {
        const { error, data: result } = await schedulerRepository.delete(id);
        if (error) {
            throw new Error(error.message);
        }
        return result;
    },
    update: async (id: string, data: SchedulerDto) => {
        const { error, data: result } = await schedulerRepository.update(id, data);
        if (error) {
            throw new Error(error.message);
        }
        return result;
    },
}