/**
 * Centralized Date Entry Validation Service
 * 
 * CORE RULE:
 * A user may ONLY enter or modify tracking data for:
 * 1. TODAY
 * 2. YESTERDAY
 * 
 * Date Status Rules:
 * - Today -> ALLOWED ('today')
 * - Yesterday -> ALLOWED ('yesterday')
 * - Day before yesterday or older -> BLOCKED ('past_locked')
 * - Tomorrow or any future date -> BLOCKED ('future_locked')
 * 
 * Uses LOCAL calendar dates (YYYY-MM-DD) avoiding UTC timezone shifts.
 */

export type DateEntryStatus = "today" | "yesterday" | "past_locked" | "future_locked";

export interface DateValidationResult {
  allowed: boolean;
  status: DateEntryStatus;
  message: string;
  localToday: string;
  localYesterday: string;
}

/**
 * Returns the local date string (YYYY-MM-DD) for a given Date object.
 * Strictly uses local calendar components (getFullYear, getMonth, getDate).
 */
export function formatLocalDate(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's local date string (YYYY-MM-DD).
 */
export function getLocalTodayStr(referenceDate: Date = new Date()): string {
  return formatLocalDate(referenceDate);
}

/**
 * Returns yesterday's local date string (YYYY-MM-DD).
 */
export function getLocalYesterdayStr(referenceDate: Date = new Date()): string {
  const yesterday = new Date(referenceDate);
  yesterday.setDate(yesterday.getDate() - 1);
  return formatLocalDate(yesterday);
}

/**
 * Validates a target date string (YYYY-MM-DD) against the entry rules.
 */
export function getEntryDateStatus(
  targetDateStr: string,
  referenceDate: Date = new Date()
): DateValidationResult {
  const todayStr = getLocalTodayStr(referenceDate);
  const yesterdayStr = getLocalYesterdayStr(referenceDate);

  if (targetDateStr === todayStr) {
    return {
      allowed: true,
      status: "today",
      message: "Allowed — Today",
      localToday: todayStr,
      localYesterday: yesterdayStr,
    };
  }

  if (targetDateStr === yesterdayStr) {
    return {
      allowed: true,
      status: "yesterday",
      message: "Allowed — Yesterday (late entry)",
      localToday: todayStr,
      localYesterday: yesterdayStr,
    };
  }

  if (targetDateStr > todayStr) {
    return {
      allowed: false,
      status: "future_locked",
      message: "Future entries aren't allowed. You can record this when the day arrives.",
      localToday: todayStr,
      localYesterday: yesterdayStr,
    };
  }

  // Any date earlier than yesterday
  return {
    allowed: false,
    status: "past_locked",
    message: "Entries can only be added for today or yesterday.",
    localToday: todayStr,
    localYesterday: yesterdayStr,
  };
}

/**
 * Quick boolean check: is this date permitted for entry or modification?
 */
export function isEntryDateAllowed(
  targetDateStr: string,
  referenceDate: Date = new Date()
): boolean {
  return getEntryDateStatus(targetDateStr, referenceDate).allowed;
}

/**
 * Strict assertion function for server actions. Throws an Error if date is not allowed.
 */
export function assertEntryDateAllowed(
  targetDateStr: string,
  operationName: string = "Data entry",
  referenceDate: Date = new Date()
): void {
  const validation = getEntryDateStatus(targetDateStr, referenceDate);
  if (!validation.allowed) {
    throw new Error(`[DateRule Violation] ${operationName} rejected for date ${targetDateStr}. ${validation.message}`);
  }
}
