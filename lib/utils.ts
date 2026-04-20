import { clsx, type ClassValue } from "clsx"
import { format } from "date-fns"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(v: number) {
  const abs = Math.abs(v)
  const formatted = abs.toLocaleString("id-ID")
  return v < 0 ? `-Rp ${formatted}` : `Rp ${formatted}`
}

export function formatDate(date: string | Date) {
  if (!date) return "-"
  return format(new Date(date), "dd MMM yyyy")
}
