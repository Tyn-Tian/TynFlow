import { budgetService } from "@/services/budget-service";
import { useQuery } from "@tanstack/react-query";

export default function useBudget(includeDeleted: boolean = false) {
  return useQuery({
    queryKey: ["budgets", includeDeleted],
    queryFn: async () => await budgetService.getAll(includeDeleted),
  });
}
