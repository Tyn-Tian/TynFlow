import { authApi } from "@/lib/api/auth-api";
import { useQuery } from "@tanstack/react-query";

export default function useRange() {
  return useQuery({
    queryKey: ["range-date"],
    queryFn: async () => await authApi.getRangeDate(),
  });
}
