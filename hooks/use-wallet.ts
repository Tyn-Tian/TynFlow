import { walletService } from "@/services/wallet-service";
import { useQuery } from "@tanstack/react-query";

export default function useWallet() {
  return useQuery({
    queryKey: ["wallets"],
    queryFn: async () => await walletService.getAll(),
  });
}
