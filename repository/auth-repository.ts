import { getSupabase } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { loginDto } from "@/types/auth-type";

export const authRepository = {
  login: (dto: loginDto) => {
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
      .select("name")
      .eq("user_id", userId)
      .single();
  },
  getRangeDate: async () => {
    const { supabase, userId } = await getSupabase();
    return supabase
      .from("profiles")
      .select("start_date, end_date")
      .eq("user_id", userId)
      .single();
  },
};
