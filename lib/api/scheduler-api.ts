import { Scheduler, SchedulerDto } from "@/types/scheduler-type";
import { apiClient } from "../apiClient";
import { BaseResponse } from "@/types/type";

export const schedulerApi = {
    getAll: () => apiClient.get<BaseResponse<Scheduler[]>>("/schedulers"),
    create: (data: SchedulerDto) => apiClient.post<BaseResponse<Scheduler>>("/schedulers", data),
    update: (id: string, data: SchedulerDto) => apiClient.put<BaseResponse<Scheduler>>(`/schedulers/${id}`, data),
    delete: (id: string) => apiClient.delete<BaseResponse<Scheduler>>(`/schedulers/${id}`),
    activate: (id: string) => apiClient.patch<BaseResponse<Scheduler>>(`/schedulers/${id}/activate`),
    deactivate: (id: string) => apiClient.patch<BaseResponse<Scheduler>>(`/schedulers/${id}/deactivate`),
};
