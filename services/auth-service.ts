import { authRepository } from "@/repository/auth-repository";
import { loginDto } from "@/types/auth-type";

export const authService = {
  login: async (dto: loginDto) => {
    const { data, error } = await authRepository.login(dto);
    if (error) throw error;
    return data;
  },
  logout: async () => {
    await authRepository.logout();
  }
};
