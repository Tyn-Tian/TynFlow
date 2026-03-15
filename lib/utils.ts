import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(v: number) {
  const abs = Math.abs(v)
  const formatted = abs.toLocaleString("id-ID")
  return v < 0 ? `-Rp ${formatted}` : `Rp ${formatted}`
}
