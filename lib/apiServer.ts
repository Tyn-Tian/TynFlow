import { createClient } from "./supabase/server";

export async function getSupabase() {
    const supabase = await createClient();
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
