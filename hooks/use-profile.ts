import { authService } from "@/services/auth-service";
import { useQuery } from "@tanstack/react-query";

export default function useProfile(enabled = true) {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => await authService.getProfile(),
    enabled,
  });
}
