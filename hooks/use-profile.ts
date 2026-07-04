import { authApi } from "@/lib/api/auth-api";
import { useQuery } from "@tanstack/react-query";

export default function useProfile(enabled = true) {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => await authApi.getProfile(),
    enabled,
  });
}
