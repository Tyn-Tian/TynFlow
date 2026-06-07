import { createClient } from "./supabase/client";

export async function getSupabase() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) throw new Error("Unauthorized");

  const userId = session.user.id;

  return {
    supabase,
    userId,
  };
}
