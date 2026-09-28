import { db } from '@/lib/db';
import { evaluateCommitment, evaluateDay, type CommitmentType } from '@/lib/evaluation';
import { getTodayStr, formatDateStr, addDays } from '@/lib/dateEngine';

export interface StreakEvalResult {
  currentStreak: number;
  longestStreak: number;
  graceDayActive: boolean;
  dayPassed: boolean;
  streakBroken: boolean;
}

export async function recalculateStreak(userId: string): Promise<StreakEvalResult> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const commitments = await db.commitment.findMany({
    where: { userId },
  });

  const records = await db.dailyRecord.findMany({
    where: { userId },
    orderBy: { date: 'asc' },
  });

  let startDate = formatDateStr(user.createdAt);
  if (records.length > 0 && records[0].date < startDate) {
    startDate = records[0].date;
  }

  const todayStr = getTodayStr();

  let currentStreak = 0;
  let longestStreak = 0;
  let graceDayActive = false;
  let streakBroken = false;
  let todayPassed = false;

  let currentDate = startDate;

  while (currentDate <= todayStr) {
    const isToday = currentDate === todayStr;
    const dayRecords = records.filter(r => r.date === currentDate);
    
    const activeCommitmentsOnDay = commitments.filter(c => {
      const cCreatedDate = formatDateStr(c.createdAt);
      if (cCreatedDate > currentDate) return false;
      if (c.isActive) return true;
      return dayRecords.some(r => r.commitmentId === c.id);
    });

    const numCommitments = activeCommitmentsOnDay.length;

    let positiveCount = 0;
    for (const record of dayRecords) {
      if (record.status === 'complete' || record.status === 'showed_up') {
        positiveCount++;
      }
    }

    // A day is passed if evaluateDay returns true and there's at least 1 commitment.
    // Actually evaluateDay(0, 0) might return true or false, let's assume if 0 commitments, it passes if we want?
    // Wait, original streak code: `if (commitments.length === 0) return ... 0 streak`. 
    // So if 0 commitments, day doesn't pass.
    let dayPassed = false;
    if (numCommitments > 0) {
      dayPassed = evaluateDay(numCommitments, positiveCount);
    }

    if (dayPassed) {
      currentStreak += 1;
      graceDayActive = false;
      streakBroken = false;
      if (isToday) todayPassed = true;
    } else {
      if (!isToday) {
        if (graceDayActive) {
          currentStreak = 0;
          graceDayActive = false;
          streakBroken = true;
        } else {
          graceDayActive = true;
          streakBroken = false;
        }
      } else {
        todayPassed = false;
      }
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    currentDate = addDays(currentDate, 1);
  }

  await db.streakState.upsert({
    where: { userId },
    create: {
      userId,
      currentStreak,
      longestStreak,
      graceDayActive,
      lastEvaluatedDate: todayStr,
    },
    update: {
      currentStreak,
      longestStreak,
      graceDayActive,
      lastEvaluatedDate: todayStr,
    },
  });

  return {
    currentStreak,
    longestStreak,
    graceDayActive,
    dayPassed: todayPassed,
    streakBroken,
  };
}

export async function evaluateAndUpdateStreak(
  userId: string,
  dateStr: string
): Promise<StreakEvalResult> {
  return recalculateStreak(userId);
}

export async function getStreakState(userId: string) {
  // Always recalculate to keep in sync
  const result = await recalculateStreak(userId);
  return {
    userId,
    currentStreak: result.currentStreak,
    longestStreak: result.longestStreak,
    graceDayActive: result.graceDayActive,
    lastEvaluatedDate: getTodayStr(),
  };
}

export async function resetStreak(userId: string) {
  await db.streakState.upsert({
    where: { userId },
    create: { userId, currentStreak: 0, longestStreak: 0, graceDayActive: false },
    update: { currentStreak: 0, graceDayActive: false, lastEvaluatedDate: null },
  });
}
