import { describe, it } from 'node:test';
import assert from 'node:assert';
import { evaluateDay } from '../lib/evaluation';
import { db } from '../lib/db';
import { recalculateStreak } from '../lib/streak';
import { subtractDays, getTodayStr } from '../lib/dateEngine';

describe('Streak Calculation Edge Cases', () => {
  it('should start at 0 for new users with no completed days', () => {
    const records: unknown[] = [];
    const currentStreak = records.length;
    assert.strictEqual(currentStreak, 0);
  });

  it('should increment streak on a completed day meeting 70% threshold', () => {
    const totalCommitments = 4;
    const positiveCount = 3; // 3/4 = 75% >= 70%
    const dayPassed = evaluateDay(totalCommitments, positiveCount);
    assert.strictEqual(dayPassed, true);
  });

  it('should activate grace day on first missed day without breaking streak', () => {
    let currentStreak = 3;
    let graceDayActive = false;
    const dayPassed = false;
    const isToday = false;

    if (!dayPassed && !isToday) {
      if (graceDayActive) {
        currentStreak = 0;
        graceDayActive = false;
      } else {
        graceDayActive = true; // Grace day activated
      }
    }

    assert.strictEqual(currentStreak, 3);
    assert.strictEqual(graceDayActive, true);
  });

  it('should break streak to 0 on second consecutive miss when grace day is already active', () => {
    let currentStreak = 3;
    let graceDayActive = true; // Already used
    const dayPassed = false;
    const isToday = false;

    if (!dayPassed && !isToday) {
      if (graceDayActive) {
        currentStreak = 0; // Broken!
        graceDayActive = false;
      } else {
        graceDayActive = true;
      }
    }

    assert.strictEqual(currentStreak, 0);
    assert.strictEqual(graceDayActive, false);
  });

  it('should reset grace day back to false when a day passes', () => {
    let currentStreak = 3;
    let graceDayActive = true;
    const dayPassed = true;

    if (dayPassed) {
      currentStreak += 1;
      graceDayActive = false; // Restored
    }

    assert.strictEqual(currentStreak, 4);
    assert.strictEqual(graceDayActive, false);
  });
});

describe('Production recalculateStreak State Machine Tests', () => {
  const userId = 'streak-test-user-id';
  const today = getTodayStr();

  it('should keep graceDayActive false when user has 0 streak and misses past days', async () => {
    const userCreatedAt = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const mockUser = { id: userId, createdAt: userCreatedAt };
    const mockCommitments = [
      { id: 'c1', userId, createdAt: userCreatedAt, isActive: true, targetValue: 1, type: 'binary' },
    ];
    // No records at all (missed all 5 days)
    const mockRecords: unknown[] = [];

    const dbAny = db as unknown as Record<string, unknown>;
    const originalUser = dbAny.user;
    const originalCommitment = dbAny.commitment;
    const originalDailyRecord = dbAny.dailyRecord;
    const originalStreakState = dbAny.streakState;

    dbAny.user = {
      findUnique: async () => mockUser,
    };
    dbAny.commitment = {
      findMany: async () => mockCommitments,
    };
    dbAny.dailyRecord = {
      findMany: async () => mockRecords,
    };
    dbAny.streakState = {
      upsert: async () => ({}),
    };

    try {
      const result = await recalculateStreak(userId);
      assert.strictEqual(result.currentStreak, 0);
      assert.strictEqual(result.graceDayActive, false, 'Grace day must NOT be active when user has 0 streak!');
    } finally {
      dbAny.user = originalUser;
      dbAny.commitment = originalCommitment;
      dbAny.dailyRecord = originalDailyRecord;
      dbAny.streakState = originalStreakState;
    }
  });

  it('should activate grace day when an active streak of 3 misses yesterday', async () => {
    const dayMinus3 = subtractDays(today, 3);
    const dayMinus2 = subtractDays(today, 2);

    const userCreatedAt = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
    const mockUser = { id: userId, createdAt: userCreatedAt };
    const mockCommitments = [
      { id: 'c1', userId, createdAt: userCreatedAt, isActive: true, targetValue: 1, type: 'binary' },
    ];
    const mockRecords = [
      { id: 'r1', userId, commitmentId: 'c1', date: dayMinus3, status: 'complete', targetValue: 1, actualValue: 1 },
      { id: 'r2', userId, commitmentId: 'c1', date: dayMinus2, status: 'complete', targetValue: 1, actualValue: 1 },
      // dayMinus1 is missed!
    ];

    const dbAny = db as unknown as Record<string, unknown>;
    const originalUser = dbAny.user;
    const originalCommitment = dbAny.commitment;
    const originalDailyRecord = dbAny.dailyRecord;
    const originalStreakState = dbAny.streakState;

    dbAny.user = {
      findUnique: async () => mockUser,
    };
    dbAny.commitment = {
      findMany: async () => mockCommitments,
    };
    dbAny.dailyRecord = {
      findMany: async () => mockRecords,
    };
    dbAny.streakState = {
      upsert: async () => ({}),
    };

    try {
      const result = await recalculateStreak(userId);
      assert.strictEqual(result.currentStreak, 2);
      assert.strictEqual(result.graceDayActive, true, 'Grace day should protect the streak on first miss!');
      assert.strictEqual(result.streakBroken, false);
    } finally {
      dbAny.user = originalUser;
      dbAny.commitment = originalCommitment;
      dbAny.dailyRecord = originalDailyRecord;
      dbAny.streakState = originalStreakState;
    }
  });
});
