import { budgetService } from "@/services/budget-service";
import { useQuery } from "@tanstack/react-query";

export default function useBudget() {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: async () => await budgetService.getAll(),
  });
}
