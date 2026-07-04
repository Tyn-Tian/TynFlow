import { walletApi } from "@/lib/api/wallet-api";
import { useQuery } from "@tanstack/react-query";

export default function useWallet() {
  return useQuery({
    queryKey: ["wallets"],
    queryFn: async () => await walletApi.getAll(),
  });
}
