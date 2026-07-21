import { jobApi } from "@/lib/api/job-api";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { JobDto } from "@/types/job-type";

export function useJobs(page: number = 1, limit: number = 100, search?: string) {
  return useQuery({
    queryKey: ["jobs", page, limit, search],
    queryFn: async () => {
      const response = await jobApi.getAll(page, limit, search);
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useAddJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: JobDto) => await jobApi.add(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: JobDto }) => await jobApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => await jobApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}
