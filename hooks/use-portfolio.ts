import { portfolioService } from "@/services/portfolio-service";
import { useQuery } from "@tanstack/react-query";

export default function usePortfolio() {
  return useQuery({
    queryKey: ["portfolios"],
    queryFn: async () => await portfolioService.getAll(),
  });
}
