import { budgetApi } from "@/lib/api/budget-api";
import { useQuery } from "@tanstack/react-query";

export default function useBudget(includeDeleted: boolean = false) {
  return useQuery({
    queryKey: ["budgets", includeDeleted],
    queryFn: async () => await budgetApi.getOptions(includeDeleted),
  });
}
