import { portfolioRepository } from "@/repository/portfolio-repository";
import { PortfolioDto } from "@/types/portfolio-type";

export const portfolioService = {
  getAll: async () => {
    const { data } = await portfolioRepository.getAll();
    return data ?? [];
  },
  add: async (dto: PortfolioDto) => {
    await portfolioRepository.create(dto);
  },
  edit: async (id: string, dto: PortfolioDto) => {
    await portfolioRepository.update(id, dto);
  },
  delete: async (id: string) => {
    await portfolioRepository.delete(id);
  },
};
