"use client";

import * as React from "react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { IconCalendar } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DashboardFilter({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const defaultDate: DateRange | undefined = React.useMemo(() => {
    if (fromParam && toParam) {
      return {
        from: new Date(fromParam),
        to: new Date(toParam),
      };
    }
    return undefined;
  }, [fromParam, toParam]);

  const [date, setDate] = React.useState<DateRange | undefined>(defaultDate);
  const [prevParams, setPrevParams] = React.useState({ from: fromParam, to: toParam });

  if (fromParam !== prevParams.from || toParam !== prevParams.to) {
    setPrevParams({ from: fromParam, to: toParam });
    setDate(
      fromParam && toParam
        ? { from: new Date(fromParam), to: new Date(toParam) }
        : undefined
    );
  }

  const handleSelect = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate);
    
    const params = new URLSearchParams(searchParams.toString());
    
    if (selectedDate?.from) {
      // Create a date using local timezone but format it to YYYY-MM-DD
      const from = new Date(selectedDate.from.getTime() - selectedDate.from.getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0];
      params.set("from", from);
    } else {
      params.delete("from");
    }
    
    if (selectedDate?.to) {
      const to = new Date(selectedDate.to.getTime() - selectedDate.to.getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0];
      params.set("to", to);
    } else {
      params.delete("to");
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilter = () => {
    setDate(undefined);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("from");
    params.delete("to");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "justify-start text-left font-normal cursor-pointer",
                !date && "text-muted-foreground"
              )}
            >
              <IconCalendar />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Filter by date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleSelect}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        
        {(fromParam || toParam) && (
          <Button 
            variant="ghost" 
            onClick={clearFilter}
            className="cursor-pointer"
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
