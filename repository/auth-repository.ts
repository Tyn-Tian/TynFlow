import { getSupabase } from "@/lib/apiServer";
import { createClient } from "@/lib/supabase/server";
import { LoginDto, UpdateProfileDto } from "@/types/auth-type";

export const authRepository = {
  login: async (dto: LoginDto) => {
    const supabase = await createClient();
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

  googleLogin: async () => {
    const supabase = await createClient();
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
        queryParams: {
          prompt: 'consent',
        },
      },
    })
  },
  forgotPassword: async (email: string) => {
    const supabase = await createClient();
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password`,
    });
  },
  resetPassword: async (password: string) => {
    const supabase = await createClient();
    return supabase.auth.updateUser({ password });
  },
};
