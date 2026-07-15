import { authRepository } from "@/repository/auth-repository";
import { LoginDto } from "@/types/auth-type";

export const authService = {
  login: async (dto: LoginDto) => {
    const { data, error } = await authRepository.login(dto);
    if (error) throw error;
    return data;
  },
  logout: async () => {
    await authRepository.logout();
  },
  getRangeDate: async () => {
    const { data } = await authRepository.getRangeDate();
    return data;
  },
  googleLogin: async () => {
    const { data, error } = await authRepository.googleLogin();
    if (error) throw error;
    return data;
  },
  forgotPassword: async (email: string) => {
    const { error } = await authRepository.forgotPassword(email)
    if (error) throw error
  },
  resetPassword: async (password: string) => {
    const { error } = await authRepository.resetPassword(password)
    if (error) throw error
  }
};
