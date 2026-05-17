import { walletRepository } from "@/repository/wallet-repository";
import { WalletDto } from "@/types/wallet-type";

export const walletService = {
  getAll: async () => {
    const { data } = await walletRepository.getAll();
    return data;
  },
  add: async (dto: WalletDto) => {
    await walletRepository.create(dto);
  },
  edit: async (id: string, dto: WalletDto) => {
    await walletRepository.update(id, dto)
  },
  delete: async (id: string) => {
    await walletRepository.delete(id);
  },
};