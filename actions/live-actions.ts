"use server"

import { createClient } from "@/lib/supabase/server"
import * as liveService from "@/services/live-service"
import { revalidatePath } from "next/cache"
import { Live } from "@/repository/live-repository"

export async function getLivesAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  return liveService.getLives(supabase, user.id)
}

export async function addLiveAction(input: { date: string; type: "Lembur" | "Biasa"; tiktok: number; shopee: number }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const isoDate = liveService.toIsoDate(input.date)

  await liveService.addLive(supabase, {
    ...input,
    date: isoDate,
    user_id: user.id
  })

  revalidatePath("/live")
}

export async function editLiveAction(id: string | number, input: { date: string; type: "Lembur" | "Biasa"; tiktok: number; shopee: number }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const isoDate = liveService.toIsoDate(input.date)

  await liveService.editLive(supabase, id, {
    ...input,
    date: isoDate
  })

  revalidatePath("/live")
}

export async function removeLiveAction(id: string | number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  // Check ownership if needed, but repository already uses filters/id
  await liveService.removeLive(supabase, id)

  revalidatePath("/live")
}
