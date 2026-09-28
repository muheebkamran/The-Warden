import { db } from "@/lib/db";
import { AppLayout } from "@/components/AppLayout";
import { SettingsManager } from "@/components/SettingsManager";
import { getUserSettings } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [goals, userSettings] = await Promise.all([
    db.goal.findMany({
      where: { active: true },
      orderBy: { createdAt: "asc" },
    }),
    getUserSettings(),
  ]);

  return (
    <AppLayout goals={goals} userSettings={userSettings}>
      <SettingsManager initialSettings={userSettings} />
    </AppLayout>
  );
}
