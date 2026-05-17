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
  },
  getProfile: async () => {
    const { data } = await authRepository.getUser();
    if (!data) return null;
    const userId = data.user?.id

    const { data: profile } = await authRepository.getProfile();
    return {
      userId: userId,
      email: data.user?.email,
      ...profile
    };
  },
  getRangeDate: async () => {
    const { data } = await authRepository.getRangeDate();
    return data;
  }
};
