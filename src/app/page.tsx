import { db } from "@/lib/db";
import AppShell from "@/components/AppShell";
import TodayDashboard from "@/components/TodayDashboard";
import { getTodayStr, getYesterdayStr } from "@/lib/dateEngine";
import { getStreakState } from "@/lib/streak";
import { requireAuth } from "@/app/actions";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { userId } = await requireAuth();
  const todayStr = getTodayStr();
  const yesterdayStr = getYesterdayStr();

  const [commitments, todayRecords, yesterdayRecords, streakState] = await Promise.all([
    db.commitment.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    }),
    db.dailyRecord.findMany({
      where: { userId, date: todayStr },
    }),
    db.dailyRecord.findMany({
      where: { userId, date: yesterdayStr },
    }),
    getStreakState(userId),
  ]);

  const records = [...todayRecords, ...yesterdayRecords];

  return (
    <AppShell>
      <TodayDashboard 
        commitments={commitments}
        records={records}
        streakState={streakState}
        todayStr={todayStr}
        yesterdayStr={yesterdayStr}
      />
    </AppShell>
  );
}