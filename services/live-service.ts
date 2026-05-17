import { liveRepository } from "@/repository/live-repository";
import { LiveDto } from "@/types/live-type";

function toIsoDate(dateStr: string) {
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts;
    return `${yyyy}-${mm}-${dd}`;
  }
  return dateStr;
}

export const liveService = {
  getAll: async () => {
    const { data } = await liveRepository.getAll();
    return data ?? [];
  },
  getById: async (id: string) => {
    const { data } = await liveRepository.getById(id);
    return data;
  },
  add: async (dto: LiveDto) => {
    await liveRepository.create({
      ...dto,
      date: toIsoDate(dto.date),
    });
  },
  edit: async (id: string, dto: LiveDto) => {
    await liveRepository.update(id, {
      ...dto,
      date: toIsoDate(dto.date),
    });
  },
  delete: async (id: string) => {
    await liveRepository.delete(id);
  },
};
