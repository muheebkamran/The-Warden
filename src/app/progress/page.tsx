import { db } from '@/lib/db';
import AppShell from '@/components/AppShell';
import { ProgressView } from '@/components/ProgressView';
import { getTodayStr } from '@/lib/dateEngine';
import { getStreakState } from '@/lib/streak';
import { requireAuth } from '@/app/actions';

export const dynamic = 'force-dynamic';

export default async function ProgressPage() {
  const { userId } = await requireAuth();

  const activeCommitments = await db.commitment.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: 'asc' }
  });

  const allRecords = await db.dailyRecord.findMany({
    where: { userId },
    orderBy: { date: 'asc' }
  });

  const streakState = await getStreakState(userId);
  const todayStr = getTodayStr();

  return (
    <AppShell>
      <header className="mb-8 animate-fade-in">
        <h1 className="font-sans uppercase tracking-[0.2em] text-xs text-[var(--text-stone)] mb-2">
          Progress
        </h1>
        <p className="font-serif italic text-2xl text-[var(--text-ivory)]">
          Your consistency over time.
        </p>
      </header>
      
      <ProgressView 
        commitments={activeCommitments} 
        allRecords={allRecords as { id: string; commitmentId: string; date: string; targetValue: number; actualValue: number; status: 'missed' | 'showed_up' | 'complete'; note: string | null }[]} 
        streakState={streakState} 
        todayStr={todayStr} 
      />
    </AppShell>
  );
}
