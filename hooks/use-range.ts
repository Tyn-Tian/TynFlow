import { authService } from "@/services/auth-service";
import { useQuery } from "@tanstack/react-query";

export default function useRange() {
  return useQuery({
    queryKey: ["range-date"],
    queryFn: async () => await authService.getRangeDate(),
  });
}
