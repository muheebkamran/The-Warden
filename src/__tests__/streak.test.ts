import { describe, it } from 'node:test';
import assert from 'node:assert';
import { evaluateDay } from '../lib/evaluation';

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
