import { walletRepository } from "@/repository/wallet-repository";
import { WalletDto } from "@/types/wallet-type";
import { SupabaseClient } from "@supabase/supabase-js";

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

// export async function updateBalance(
//   supabase: SupabaseClient,
//   id: string,
//   delta: number,
// ) {
//   const { data: wData, error: wErr } = await walletRepository.getWalletById(
//     supabase,
//     id,
//   );
//   if (wErr) throw new Error(wErr.message);

//   const currentBalance = wData?.balance ?? 0;
//   const newBalance = currentBalance + delta;
//   const { error } = await walletRepository.updateWallet(supabase, id, {
//     balance: newBalance,
//   });
//   if (error) throw new Error(error.message);
// }
