import { format } from 'date-fns';

/**
 * Parse a date string (YYYY-MM-DD) into a Date object without timezone issues
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object representing the local date
 */
export const parseDateString = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // Month is 0-indexed
};

/**
 * Format a date string safely without timezone issues
 * @param dateString - Date string in YYYY-MM-DD format
 * @param formatString - Format string for date-fns
 * @returns Formatted date string
 */
export const formatDateSafe = (dateString: string, formatString: string): string => {
  const date = parseDateString(dateString);
  return format(date, formatString);
};

/**
 * Get today's date as a YYYY-MM-DD string
 * @returns Today's date string
 */
export const getTodayString = (): string => {
  const today = new Date();
  return format(today, 'yyyy-MM-dd');
};

/**
 * Check if a date string represents today
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns True if the date is today
 */
export const isToday = (dateString: string): boolean => {
  return dateString === getTodayString();
};

/**
 * Check if a date string is in the past
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns True if the date is in the past
 */
export const isPastDate = (dateString: string): boolean => {
  const date = parseDateString(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to compare dates only
  return date < today;
};

/**
 * Get the number of days between two date strings
 * @param startDate - Start date string in YYYY-MM-DD format
 * @param endDate - End date string in YYYY-MM-DD format
 * @returns Number of days between the dates (inclusive)
 */
export const getDaysBetween = (startDate: string, endDate: string): number => {
  const start = parseDateString(startDate);
  const end = parseDateString(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end dates
}; 