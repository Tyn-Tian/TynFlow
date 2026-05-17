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
  updateValue: async (id: string, delta: number) => {
    const { data } = await portfolioRepository.getById(id);

    const newInvested = data?.invested + delta;
    const newValue = data?.current_value + delta;

    await portfolioRepository.update(id, {
      name: data?.name,
      type: data?.type,
      target: data?.target,
      invested: newInvested,
      current_value: newValue,
    });
  },
};
