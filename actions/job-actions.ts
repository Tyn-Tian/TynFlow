"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import * as jobService from "@/services/job-service"

export async function fetchJobsAction(params: { page: number; pageSize: number }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  return jobService.getPaginatedJobs(supabase, {
    userId: user.id,
    page: params.page,
    pageSize: params.pageSize,
  })
}

export async function fetchAllJobsAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return jobService.getAllJobs(supabase, user.id)
}

export async function addJobAction(job: {
  position: string
  company: string
  source: string
  status: string
  applied_at: string
  updated_at: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  await jobService.addJob(supabase, { ...job, user_id: user.id })
  revalidatePath("/job")
}

export async function deleteJobAction(id: number | string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  await jobService.removeJob(supabase, id)
  revalidatePath("/job")
}
