import { authRepository } from "@/repository/auth-repository";
import { LoginDto, UpdateProfileDto } from "@/types/auth-type";

export const authService = {
  login: async (dto: LoginDto) => {
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
    const userId = data.user?.id;

    const { data: profile } = await authRepository.getProfile();
    return {
      userId: userId,
      email: data.user?.email,
      ...profile,
    };
  },
  updateProfile: async (dto: UpdateProfileDto) => {
    await authRepository.updateProfile(dto);
  },
  getRangeDate: async () => {
    const { data } = await authRepository.getRangeDate();
    return data;
  },
};
