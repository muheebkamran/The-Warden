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
      <header className="mb-8 animate-fade-in">
        <h1 className="font-sans uppercase tracking-[0.2em] text-xs text-[var(--text-stone)] mb-2">
          Settings
        </h1>
        <p className="font-serif italic text-2xl text-[var(--text-ivory)]">
          Configure your system.
        </p>
      </header>
      
      <SettingsView user={user} streakState={streakState} />
    </AppShell>
  );
}
