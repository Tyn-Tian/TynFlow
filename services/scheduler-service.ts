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
}