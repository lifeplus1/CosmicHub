/**
 * Date formatting utilities for CosmicHub
 * Provides consistent date formatting across the application
 */

/**
 * Format a date string for display with error handling
 * @param date - Date string, Date object, or null/undefined
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted date string or fallback
 */
export function formatDate(
  date: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  if (date === null || date === undefined || date === '') {
    return 'Unknown';
  }

  try {
    const d = typeof date === 'string' ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(d.getTime())) {
      return 'Invalid Date';
    }

    return d.toLocaleDateString('en-US', options);
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Format a date for compact display (MM/DD/YYYY)
 * @param date - Date string, Date object, or null/undefined
 * @returns Formatted date string or fallback
 */
export function formatDateCompact(
  date: string | Date | null | undefined
): string {
  return formatDate(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Format a date for ISO display (YYYY-MM-DD)
 * @param date - Date string, Date object, or null/undefined
 * @returns Formatted date string or fallback
 */
export function formatDateISO(
  date: string | Date | null | undefined
): string {
  return formatDate(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Format a date with time for display
 * @param date - Date string, Date object, or null/undefined
 * @returns Formatted date and time string or fallback
 */
export function formatDateTime(
  date: string | Date | null | undefined
): string {
  if (date === null || date === undefined || date === '') {
    return 'Unknown';
  }

  try {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) {
      return 'Invalid Date';
    }

    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Check if a date is valid
 * @param date - Date to validate
 * @returns True if date is valid
 */
export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Parse a date string safely
 * @param dateString - Date string to parse
 * @returns Date object or null if invalid
 */
export function parseDateSafe(dateString: string): Date | null {
  if (!dateString || typeof dateString !== 'string') {
    return null;
  }

  const date = new Date(dateString);
  return isValidDate(date) ? date : null;
}
