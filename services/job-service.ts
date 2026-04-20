import { SupabaseClient } from "@supabase/supabase-js"
import * as jobRepository from "@/repository/job-repository"

export async function getPaginatedJobs(
  supabase: SupabaseClient,
  params: { userId: string; page: number; pageSize: number }
) {
  const { userId, page, pageSize } = params
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await jobRepository.findJobsByUserId(supabase, userId, { from, to })

  if (error) throw new Error(error.message)

  return {
    data: data || [],
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

export async function getAllJobs(supabase: SupabaseClient, userId: string) {
  const { data, error } = await jobRepository.findAllJobsByUserId(supabase, userId)
  if (error) throw new Error(error.message)
  return data || []
}

export async function addJob(supabase: SupabaseClient, job: Omit<jobRepository.Job, "id"> & { user_id: string }) {
  const { error } = await jobRepository.insertJob(supabase, job)
  if (error) throw new Error(error.message)
}

export async function removeJob(supabase: SupabaseClient, id: number | string) {
  const { error } = await jobRepository.deleteJobById(supabase, id)
  if (error) throw new Error(error.message)
}

export async function editJob(supabase: SupabaseClient, id: number | string, job: Partial<jobRepository.Job>) {
  const { error } = await jobRepository.updateJobById(supabase, id, job)
  if (error) throw new Error(error.message)
}
