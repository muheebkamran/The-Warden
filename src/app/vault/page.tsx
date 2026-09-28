import { db } from "@/lib/db";
import { AppLayout } from "@/components/AppLayout";
import { UnifiedVault } from "@/components/UnifiedVault";
import { getLocalTodayStr } from "@/lib/dateRules";

import { getUserSettings } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function VaultPage() {
  const todayStr = getLocalTodayStr();

  const [goals, allPromises, stats, userSettings] = await Promise.all([
    db.goal.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } }),
    db.promise.findMany({
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    db.identityStats.findUnique({ where: { id: "singleton" } }),
    getUserSettings(),
  ]);

  return (
    <AppLayout goals={goals} userSettings={userSettings}>
      <UnifiedVault
        promises={allPromises}
        longestStreak={stats?.longestStreak ?? 0}
        todayStr={todayStr}
      />
    </AppLayout>
  );
}
