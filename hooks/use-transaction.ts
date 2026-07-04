import { transactionApi } from "@/lib/api/transaction-api";
import { Filters } from "@/types/transaction-type";
import { useQuery } from "@tanstack/react-query";

export default function useTransactions(filters: Filters) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: async () => await transactionApi.findTransactions(filters),
  });
}
