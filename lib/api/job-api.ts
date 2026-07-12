import { Job, JobDto } from "@/types/job-type";
import { apiClient } from "../apiClient";
import { BaseResponse } from "@/types/type";

export const jobApi = {
    getAll: (page: number = 1, limit: number = 10) => apiClient.get<BaseResponse<{ jobs: Job[], count: number }>>(`/jobs?page=${page}&limit=${limit}`),
    add: (data: JobDto) => apiClient.post<BaseResponse<null>>("/jobs", data),
    update: (id: string, data: JobDto) => apiClient.put<BaseResponse<null>>(`/jobs/${id}`, data),
    delete: (id: string) => apiClient.delete<BaseResponse<null>>(`/jobs/${id}`),
};