"use server"

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
