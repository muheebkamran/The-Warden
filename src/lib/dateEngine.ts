/**
 * Date Engine — Temporal Integrity Service — THE WARDEN
 *
 * Handles date validation, navigation boundaries, and timezone-safe operations.
 * Enforces: Today = editable, Yesterday = limited, Older = locked, Future = blocked.
 */

export type DateEditability = 'editable' | 'limited' | 'locked' | 'future';

/**
 * Gets today's date string in YYYY-MM-DD format (local timezone).
 */
export function getTodayStr(): string {
  return formatDateStr(new Date());
}

/**
 * Gets yesterday's date string in YYYY-MM-DD format (local timezone).
 */
export function getYesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDateStr(d);
}

/**
 * Formats a Date object to YYYY-MM-DD string (local timezone).
 */
export function formatDateStr(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD string into a Date object (local timezone, midnight).
 */
export function parseDateStr(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Determines the editability status of a given date.
 */
export function getDateEditability(dateStr: string): DateEditability {
  const today = getTodayStr();
  const yesterday = getYesterdayStr();

  if (dateStr === today) return 'editable';
  if (dateStr === yesterday) return 'limited';
  if (dateStr > today) return 'future';
  return 'locked';
}

/**
 * Server-side assertion: throws if the date is not allowed for editing.
 */
export function assertDateAllowed(dateStr: string, action: string): void {
  const editability = getDateEditability(dateStr);

  if (editability === 'future') {
    throw new Error(`${action}: Cannot create or edit records for future dates (${dateStr}).`);
  }
  if (editability === 'locked') {
    throw new Error(`${action}: Date ${dateStr} is locked. Only today and yesterday are editable.`);
  }
}

/**
 * Returns an array of date strings for the last N days (including today), oldest first.
 */
export function getLastNDays(n: number): string[] {
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(formatDateStr(d));
  }
  return dates;
}

/**
 * Returns all date strings in a given month (1-indexed month), oldest first.
 */
export function getMonthDates(year: number, month: number): string[] {
  const dates: string[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    dates.push(formatDateStr(new Date(year, month - 1, day)));
  }
  return dates;
}

/**
 * Gets the short weekday name for a date string ("Mon", "Tue", etc.).
 */
export function getDayName(dateStr: string): string {
  return parseDateStr(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Gets the day-of-month number from a date string.
 */
export function getDayNumber(dateStr: string): number {
  return parseInt(dateStr.split('-')[2], 10);
}

/**
 * Formats a date string for display: "Sep 28, 2026"
 */
export function formatDisplayDate(dateStr: string): string {
  const date = parseDateStr(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Returns whether two date strings are the same calendar day.
 */
export function isSameDay(a: string, b: string): boolean {
  return a === b;
}

/**
 * Returns the date string for N days before the given date string.
 */
export function subtractDays(dateStr: string, n: number): string {
  const d = parseDateStr(dateStr);
  d.setDate(d.getDate() - n);
  return formatDateStr(d);
}

/**
 * Returns the date string for the day after the given date string.
 */
export function addDays(dateStr: string, n: number): string {
  const d = parseDateStr(dateStr);
  d.setDate(d.getDate() + n);
  return formatDateStr(d);
}
