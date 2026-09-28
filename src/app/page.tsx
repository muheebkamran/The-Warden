import { db } from "@/lib/db";
import { AppLayout } from "@/components/AppLayout";
import { HomeCommandCenter } from "@/components/HomeCommandCenter";
import { getLocalTodayStr } from "@/lib/dateRules";
import { getUserSettings } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const todayStr = getLocalTodayStr();

  const [goals, records, promises, identityStats, userSettings] =
    await Promise.all([
      db.goal.findMany({
        where: { active: true },
        orderBy: { createdAt: "asc" },
      }),
      db.dailyRecord.findMany({
        include: { goals: true },
        orderBy: { date: "asc" },
      }),
      db.promise.findMany({
        orderBy: { createdAt: "desc" },
      }),
      db.identityStats.findUnique({
        where: { id: "singleton" },
      }),
      getUserSettings(),
    ]);

  return (
    <AppLayout goals={goals} userSettings={userSettings}>
      <HomeCommandCenter
        goals={goals}
        records={records}
        promises={promises}
        identityStats={identityStats}
        userName={userSettings?.name || "Muheeb"}
        currentDateStr={todayStr}
      />
    </AppLayout>
  );
}