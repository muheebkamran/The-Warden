import { db } from '@/lib/db';
import AppShell from '@/components/AppShell';
import { SettingsView } from '@/components/SettingsView';
import { getStreakState } from '@/lib/streak';
import { requireAuth } from '@/app/actions';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const { userId } = await requireAuth();
  
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const streakState = await getStreakState(userId);

  return (
    <AppShell>
      <SettingsView user={user} streakState={streakState} />
    </AppShell>
  );
}
