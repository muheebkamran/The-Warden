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

  const [commitments, allRecords, streakState] = await Promise.all([
    db.commitment.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    }),
    db.dailyRecord.findMany({
      where: { userId },
      orderBy: { date: 'asc' }
    }),
    getStreakState(userId),
  ]);

  const records = allRecords;

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