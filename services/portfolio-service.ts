import { portfolioRepository } from "@/repository/portfolio-repository";
import { PortfolioDto, Portfolio, PortfolioSnapshot } from "@/types/portfolio-type";

export const portfolioService = {
  getAll: async (): Promise<Portfolio[]> => {
    const { data } = await portfolioRepository.getAll();
    return (data as Portfolio[]) ?? [];
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

    const newInvested = Number(data?.invested || 0) + Number(delta);
    const newValue = Number(data?.current_value || 0) + Number(delta);

    await portfolioRepository.update(id, {
      name: data?.name,
      type: data?.type,
      target: data?.target,
      invested: newInvested,
      current_value: newValue,
    });
  },
  getSnapshots: async (): Promise<PortfolioSnapshot[]> => {
    const { data } = await portfolioRepository.getSnapshots();
    return (data as PortfolioSnapshot[]) ?? [];
  },
};
