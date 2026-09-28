import { db } from "@/lib/db";
import { AppLayout } from "@/components/AppLayout";
import { UnifiedMatrix } from "@/components/UnifiedMatrix";
import { getLocalTodayStr } from "@/lib/dateRules";

import { getUserSettings } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function MatrixPage() {
  const now = new Date();
  const todayStr = getLocalTodayStr(now);
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();

  const [goals, allRecords, userSettings] = await Promise.all([
    db.goal.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } }),
    db.dailyRecord.findMany({ include: { goals: true }, orderBy: { date: "asc" } }),
    getUserSettings(),
  ]);

  return (
    <AppLayout goals={goals} userSettings={userSettings}>
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-zinc-200 px-8 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-xs">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Habit Matrix
            </h1>
            <p className="text-xs text-zinc-500">
              31-Day Execution Grid
            </p>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-8 max-w-7xl mx-auto w-full flex-1">
          <UnifiedMatrix
            goals={goals}
            records={allRecords}
            currentDateStr={todayStr}
            initialYear={currentYear}
            initialMonthIndex={currentMonthIndex}
          />
        </div>
      </div>
    </AppLayout>
  );
}
