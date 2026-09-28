import { db } from "@/lib/db";
import { AppLayout } from "@/components/AppLayout";
import { HabitsManager } from "@/components/HabitsManager";
import { getUserSettings } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const [goals, records, userSettings] = await Promise.all([
    db.goal.findMany({
      where: { active: true },
      orderBy: { createdAt: "asc" },
    }),
    db.dailyRecord.findMany({
      include: { goals: true },
      orderBy: { date: "asc" },
    }),
    getUserSettings(),
  ]);

  return (
    <AppLayout goals={goals} userSettings={userSettings}>
      <HabitsManager goals={goals} records={records} />
    </AppLayout>
  );
}
