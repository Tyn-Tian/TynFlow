import { getSupabase } from "@/lib/api";
import { SchedulerDto } from "@/types/scheduler-type";

export const schedulerRepository = {
    getAll: async () => {
        const { supabase, userId } = await getSupabase();
        return supabase
            .from("schedulers")
            .select("id, name, type, amount, frequency, next_run_date, status")
            .eq("user_id", userId)
            .order("name", { ascending: true });
    },
    add: async (data: SchedulerDto) => {
        const { supabase, userId } = await getSupabase();
        return supabase
            .from("schedulers")
            .insert([{ ...data, user_id: userId }])
            .select();
    },
    deactivate: async (id: string) => {
        const { supabase, userId } = await getSupabase();
        return supabase
            .from("schedulers")
            .update({ status: "Inactive" })
            .eq("id", id)
            .eq("user_id", userId)
            .select();
    },
}