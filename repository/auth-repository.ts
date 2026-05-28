import { getSupabase } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { LoginDto, UpdateProfileDto } from "@/types/auth-type";

export const authRepository = {
  login: (dto: LoginDto) => {
    const supabase = createClient();
    return supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });
  },
  logout: async () => {
    const { supabase } = await getSupabase();
    return supabase.auth.signOut();
  },
  getUser: async () => {
    const { supabase } = await getSupabase();
    return supabase.auth.getUser();
  },
  getProfile: async () => {
    const { supabase, userId } = await getSupabase();
    return supabase
      .from("profiles")
      .select("name, start_date, end_date")
      .eq("user_id", userId)
      .single();
  },
  updateProfile: async (dto: UpdateProfileDto) => {
    const { supabase, userId } = await getSupabase();
    return supabase
      .from("profiles")
      .update(dto)
      .eq("user_id", userId);
  },
  getRangeDate: async () => {
    const { supabase, userId } = await getSupabase();
    return supabase
      .from("profiles")
      .select("start_date, end_date")
      .eq("user_id", userId)
      .single();
  },

  googleLogin: () => {
    const supabase = createClient();
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: {
          prompt: 'consent',
        },
      },
    })
  },
  forgotPassword: (email: string) => {
    const supabase = createClient();
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  },
  resetPassword: (password: string) => {
    const supabase = createClient();
    return supabase.auth.updateUser({ password });
  },
};
