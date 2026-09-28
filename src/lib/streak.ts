/**
 * Streak Evaluation Engine — THE WARDEN (Server-Side Only)
 *
 * Implements the streak state machine with Grace Day mechanics.
 *
 * State transitions:
 *   Pass (prev was Pass)  → current_streak += 1, grace = false
 *   Pass (prev was Miss/Grace) → current_streak += 1, grace = false
 *   Miss (first miss)      → grace_day_active = true, streak holds
 *   Miss (second consec.)  → current_streak = 0, grace = false, streak ends
 */

import { db } from '@/lib/db';
import { evaluateCommitment, evaluateDay, type CommitmentType } from '@/lib/evaluation';

export interface StreakEvalResult {
  currentStreak: number;
  longestStreak: number;
  graceDayActive: boolean;
  dayPassed: boolean;
  streakBroken: boolean;
}

/**
 * Evaluates a specific date and updates the streak state machine.
 * Must be called server-side only.
 */
export async function evaluateAndUpdateStreak(
  userId: string,
  dateStr: string
): Promise<StreakEvalResult> {
  // 1. Get all active commitments for the user
  const commitments = await db.commitment.findMany({
    where: { userId, isActive: true },
  });

  if (commitments.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      graceDayActive: false,
      dayPassed: false,
      streakBroken: false,
    };
  }

  // 2. Get all daily records for this date
  const records = await db.dailyRecord.findMany({
    where: { userId, date: dateStr },
  });

  // 3. Count positive outcomes (complete + showed_up)
  let positiveCount = 0;
  for (const record of records) {
    if (record.status === 'complete' || record.status === 'showed_up') {
      positiveCount++;
    }
  }

  // 4. Evaluate day
  const dayPassed = evaluateDay(commitments.length, positiveCount);

  // 5. Get or create streak state
  let streakState = await db.streakState.findUnique({
    where: { userId },
  });

  if (!streakState) {
    streakState = await db.streakState.create({
      data: { userId },
    });
  }

  // 6. Apply state machine transitions
  let { currentStreak, longestStreak, graceDayActive } = streakState;
  let streakBroken = false;

  if (dayPassed) {
    // Day passed: increment streak, clear grace
    currentStreak += 1;
    graceDayActive = false;
  } else {
    // Day missed
    if (graceDayActive) {
      // Second consecutive miss: streak breaks
      currentStreak = 0;
      graceDayActive = false;
      streakBroken = true;
    } else {
      // First miss: activate grace day, streak holds
      graceDayActive = true;
    }
  }

  // Update longest streak
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // 7. Persist state
  await db.streakState.update({
    where: { userId },
    data: {
      currentStreak,
      longestStreak,
      graceDayActive,
      lastEvaluatedDate: dateStr,
    },
  });

  return {
    currentStreak,
    longestStreak,
    graceDayActive,
    dayPassed,
    streakBroken,
  };
}

/**
 * Gets the current streak state for a user without modifying it.
 */
export async function getStreakState(userId: string) {
  let state = await db.streakState.findUnique({
    where: { userId },
  });

  if (!state) {
    state = await db.streakState.create({
      data: { userId },
    });
  }

  return state;
}

/**
 * Resets the streak state for a user (danger zone action).
 */
export async function resetStreak(userId: string) {
  await db.streakState.upsert({
    where: { userId },
    create: { userId, currentStreak: 0, longestStreak: 0, graceDayActive: false },
    update: { currentStreak: 0, graceDayActive: false, lastEvaluatedDate: null },
  });
}
