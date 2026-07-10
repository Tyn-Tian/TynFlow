import { Live, LiveDto } from "@/types/live-type";
import { apiClient } from "../apiClient";
import { BaseResponse } from "@/types/type";

export const liveApi = {
    getAll: () => apiClient.get<BaseResponse<Live[]>>("/lives"),
    add: (data: LiveDto) => apiClient.post<BaseResponse<null>>("/lives", data),
    update: (id: string, data: LiveDto) => apiClient.put<BaseResponse<null>>(`/lives/${id}`, data),
    delete: (id: string) => apiClient.delete<BaseResponse<null>>(`/lives/${id}`),
};
