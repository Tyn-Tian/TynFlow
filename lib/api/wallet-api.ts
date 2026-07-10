import { BaseResponse } from "@/types/type";
import { Wallet, WalletDto } from "@/types/wallet-type";
import { apiClient } from "../apiClient";

export const walletApi = {
    getAll: () => apiClient.get<BaseResponse<Wallet[]>>("/wallets"),
    add: (data: WalletDto) => apiClient.post<BaseResponse<null>>("/wallets", data),
    update: (id: string, data: WalletDto) => apiClient.put<BaseResponse<null>>(`/wallets/${id}`, data),
    delete: (id: string) => apiClient.delete<BaseResponse<null>>(`/wallets/${id}`),
};