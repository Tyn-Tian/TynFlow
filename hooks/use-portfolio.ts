import { portfolioApi } from "@/lib/api/portfolio-api";
import { useQuery } from "@tanstack/react-query";

export default function usePortfolio() {
  return useQuery({
    queryKey: ["portfolios"],
    queryFn: async () => await portfolioApi.getAll(),
  });
}
