import { db } from './src/lib/db.js';
import { recalculateStreak } from './src/lib/streak.ts';
import { getTodayStr, subtractDays } from './src/lib/dateEngine.ts';

async function runQA() {
  console.log('--- STARTING QA TEST ---');
  
  // 1. Create a dummy QA user
  const user = await db.user.create({
    data: {
      email: 'qa-tester-' + Date.now() + '@test.com',
      passwordHash: 'dummy',
    }
  });
  console.log('Created test user:', user.id);

  // 2. Create 2 commitments
  const c1 = await db.commitment.create({
    data: { userId: user.id, title: 'Read', type: 'duration', targetValue: 30 }
  });
  const c2 = await db.commitment.create({
    data: { userId: user.id, title: 'Gym', type: 'binary', targetValue: 1 }
  });
  console.log('Created 2 commitments for user');

  const today = getTodayStr();
  const day1 = subtractDays(today, 3);
  const day2 = subtractDays(today, 2);
  const day3 = subtractDays(today, 1);

  // 3. Simulate Day 1: Passed (Logged both)
  await db.dailyRecord.createMany({
    data: [
      { userId: user.id, commitmentId: c1.id, date: day1, targetValue: 30, actualValue: 30, status: 'complete' },
      { userId: user.id, commitmentId: c2.id, date: day1, targetValue: 1, actualValue: 1, status: 'complete' },
    ]
  });

  // 4. Simulate Day 2: Missed (Logged 0)
  // No records created for day2

  // 5. Simulate Day 3: Passed (Logged 1 which is 50%, but wait! 1/2 is 50%. The requirement is 70%.
  // So logging 1 out of 2 will FAIL the day. Let's log both to pass.)
  await db.dailyRecord.createMany({
    data: [
      { userId: user.id, commitmentId: c1.id, date: day3, targetValue: 30, actualValue: 30, status: 'complete' },
      { userId: user.id, commitmentId: c2.id, date: day3, targetValue: 1, actualValue: 1, status: 'complete' },
    ]
  });

  console.log('Inserted daily records.');

  // 6. Recalculate Streak
  const streak = await recalculateStreak(user.id);
  console.log('\n--- QA RESULTS ---');
  console.log('Current Streak:', streak.currentStreak);
  console.log('Longest Streak:', streak.longestStreak);
  console.log('Grace Day Active:', streak.graceDayActive);

  // Expected logic:
  // Day 1: Pass -> Streak 1, Grace False
  // Day 2: Miss -> Streak 1, Grace True
  // Day 3: Pass -> Streak 2, Grace False
  // Today: Not passed yet -> Streak 2 (streak holds, no grace used for today yet)

  if (streak.currentStreak === 2 && !streak.graceDayActive) {
    console.log('✅ STREAK LOGIC PASSED');
  } else {
    console.log('❌ STREAK LOGIC FAILED');
  }

  // 7. Test isolation / delete My Data cascade
  await db.user.delete({ where: { id: user.id }});
  console.log('Deleted QA user.');
  
  process.exit(0);
}

runQA().catch(e => {
  console.error(e);
  process.exit(1);
});
