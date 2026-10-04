import { getLastNDays, parseDateStr, subtractDays } from './dateEngine';
import { evaluateDay } from './evaluation';

export interface CommitmentRef {
  id: string;
  title: string;
  type: string;
  targetValue: number;
  unit: string;
  isActive?: boolean;
}

export interface DailyRecordRef {
  id: string;
  commitmentId: string;
  date: string;
  targetValue: number;
  actualValue: number;
  status: 'missed' | 'showed_up' | 'complete';
  note?: string | null;
}

export interface WeeklyVelocityPoint {
  week: string;
  passedDays: number;
  totalDays: number;
  completionRate: number;
  benchmark: number;
  habitsKept: number;
  habitsTarget: number;
}

export interface ConsistencyTrendPoint {
  date: string;
  displayDate: string;
  completionRate: number;
  benchmark: number;
  passed: boolean;
  habitsKept: number;
  habitsTotal: number;
}

/**
 * Transforms records into a 4-week activity velocity dataset.
 */
export function getWeeklyVelocityData(
  allRecords: DailyRecordRef[],
  commitments: CommitmentRef[]
): WeeklyVelocityPoint[] {
  const activeCount = commitments.length;
  const weeks: WeeklyVelocityPoint[] = [];

  // Group into 4 discrete 7-day intervals: W-3, W-2, W-1, and Current Week
  const weekLabels = ['3 Weeks Ago', '2 Weeks Ago', 'Last Week', 'This Week'];

  for (let w = 3; w >= 0; w--) {
    const endDaysAgo = w * 7;
    const startDaysAgo = endDaysAgo + 6;

    let passedDays = 0;
    let habitsKept = 0;
    const totalDays = 7;

    for (let d = startDaysAgo; d >= endDaysAgo; d--) {
      const dateStr = subtractDays(new Date().toISOString().split('T')[0], d);
      const dayRecords = allRecords.filter((r) => r.date === dateStr);
      const positiveCount = dayRecords.filter(
        (r) => r.status === 'complete' || r.status === 'showed_up'
      ).length;

      habitsKept += positiveCount;

      if (activeCount > 0 && evaluateDay(activeCount, positiveCount)) {
        passedDays++;
      }
    }

    const habitsTarget = activeCount * totalDays;
    const completionRate =
      totalDays > 0 ? Math.round((passedDays / totalDays) * 100) : 0;

    weeks.push({
      week: weekLabels[3 - w],
      passedDays,
      totalDays,
      completionRate,
      benchmark: 70,
      habitsKept,
      habitsTarget,
    });
  }

  return weeks;
}

/**
 * Transforms records into a 30-day consistency trend dataset for Area Chart.
 */
export function get30DayConsistencyData(
  allRecords: DailyRecordRef[],
  commitments: CommitmentRef[]
): ConsistencyTrendPoint[] {
  const last30 = getLastNDays(30);
  const activeCount = commitments.length;

  return last30.map((dateStr) => {
    const d = parseDateStr(dateStr);
    const displayDate = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    const dayRecords = allRecords.filter((r) => r.date === dateStr);
    const positiveCount = dayRecords.filter(
      (r) => r.status === 'complete' || r.status === 'showed_up'
    ).length;

    const completionRate =
      activeCount > 0 ? Math.min(100, Math.round((positiveCount / activeCount) * 100)) : 0;

    const passed = activeCount > 0 ? evaluateDay(activeCount, positiveCount) : false;

    return {
      date: dateStr,
      displayDate,
      completionRate,
      benchmark: 70,
      passed,
      habitsKept: positiveCount,
      habitsTotal: activeCount,
    };
  });
}
