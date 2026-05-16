import { createClient } from "./supabase/client";

export async function getSupabase() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase;
}
