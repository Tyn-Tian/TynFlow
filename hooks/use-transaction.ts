import { transactionService2 } from "@/services/transaction-service.new";
import { Filters } from "@/types/transaction-type";
import { useQuery } from "@tanstack/react-query";

export default function useTransactions(filters: Filters) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: async () => await transactionService2.findTransactions(filters),
  });
}
