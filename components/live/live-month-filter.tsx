"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconCalendarEvent } from "@tabler/icons-react";

export function LiveMonthFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current month as YYYY-MM
  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const selectedMonth = searchParams.get("month") || currentMonth;

  // Generate last 12 months for the dropdown
  const months = useMemo(() => {
    const result = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
      result.push({ value, label });
    }
    return result;
  }, []);

  const handleValueChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === currentMonth) {
        params.delete("month"); // clean url if current month
      } else {
        params.set("month", value);
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [currentMonth, pathname, router, searchParams]
  );

  return (
    <Select value={selectedMonth} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[180px] cursor-pointer">
        <div className="flex items-center gap-2">
          <IconCalendarEvent className="size-4 text-muted-foreground" />
          <SelectValue placeholder="Pilih Bulan" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {months.map((month) => (
          <SelectItem key={month.value} value={month.value} className="cursor-pointer">
            {month.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
