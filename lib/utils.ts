import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get current date in Indonesia timezone (UTC+7)
 * Returns a Date object set to midnight of the current date in WIB
 */
export function getIndonesiaDate(): Date {
  const now = new Date();
  // Get UTC time and add 7 hours for WIB (UTC+7)
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const wibTime = new Date(utcTime + 7 * 60 * 60 * 1000);
  // Return date only (midnight)
  return new Date(Date.UTC(wibTime.getFullYear(), wibTime.getMonth(), wibTime.getDate()));
}

/**
 * Get start of month in Indonesia timezone
 */
export function getIndonesiaMonthStart(year: number, month: number): Date {
  return new Date(Date.UTC(year, month - 1, 1));
}

/**
 * Get end of month in Indonesia timezone
 */
export function getIndonesiaMonthEnd(year: number, month: number): Date {
  return new Date(Date.UTC(year, month, 0));
}

/**
 * Get current year and month in Indonesia timezone
 */
export function getIndonesiaYearMonth(): { year: number; month: number } {
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const wibTime = new Date(utcTime + 7 * 60 * 60 * 1000);
  return {
    year: wibTime.getFullYear(),
    month: wibTime.getMonth() + 1,
  };
}
