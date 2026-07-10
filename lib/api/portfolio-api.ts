import { Portfolio, PortfolioDto, PortfolioSnapshot } from "@/types/portfolio-type";
import { apiClient } from "../apiClient";
import { BaseResponse } from "@/types/type";

export const portfolioApi = {
    getAll: () => apiClient.get<BaseResponse<Portfolio[]>>("/portfolios"),
    getSnapshots: () => apiClient.get<BaseResponse<PortfolioSnapshot[]>>("/portfolios/snapshots"),
    add: (data: PortfolioDto) => apiClient.post<BaseResponse<Portfolio>>("/portfolios", data),
    update: (id: string, data: PortfolioDto) => apiClient.put<BaseResponse<Portfolio>>(`/portfolios/${id}`, data),
    delete: (id: string) => apiClient.delete<BaseResponse<void>>(`/portfolios/${id}`)
};
