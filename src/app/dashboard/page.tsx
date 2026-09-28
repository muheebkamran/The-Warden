import { db } from "@/lib/db";
import { AppLayout } from "@/components/AppLayout";
import { HabitifyDashboard } from "@/components/HabitifyDashboard";
import { getLocalTodayStr } from "@/lib/dateRules";
import { getUserSettings } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const todayStr = getLocalTodayStr();

  const [goals, records, notes, userSettings] = await Promise.all([
    db.goal.findMany({
      where: { active: true },
      orderBy: { createdAt: "asc" },
    }),
    db.dailyRecord.findMany({
      include: { goals: true },
      orderBy: { date: "asc" },
    }),
    db.note.findMany({
      orderBy: { createdAt: "desc" },
    }),
    getUserSettings(),
  ]);

  return (
    <AppLayout goals={goals} userSettings={userSettings}>
      <HabitifyDashboard
        goals={goals}
        records={records}
        notes={notes}
        currentDateStr={todayStr}
      />
    </AppLayout>
  );
}
