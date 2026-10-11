import { db } from "@/lib/db";
import AppShell from "@/components/AppShell";
import TodayDashboard from "@/components/TodayDashboard";
import { getTodayStr, getYesterdayStr, formatDateStr } from "@/lib/dateEngine";
import { getStreakState } from "@/lib/streak";
import { requireAuth } from "@/app/actions";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { userId } = await requireAuth();
  const todayStr = getTodayStr();
  const yesterdayStr = getYesterdayStr();

  // Calculate 30-day temporal boundary to prevent unbounded full-table scans
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffDate = formatDateStr(cutoff);

  const [commitments, records, streakState] = await Promise.all([
    db.commitment.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    }),
    db.dailyRecord.findMany({
      where: {
        userId,
        date: { gte: cutoffDate },
      },
      orderBy: { date: 'asc' },
    }),
    getStreakState(userId),
  ]);

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
