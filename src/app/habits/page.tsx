import { db } from "@/lib/db";
import AppShell from "@/components/AppShell";
import HabitsManager from "@/components/HabitsManager";
import { requireAuth } from "@/app/actions";

export const dynamic = 'force-dynamic';

export default async function HabitsPage() {
  const { userId } = await requireAuth();
  const commitments = await db.commitment.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <AppShell>
      <div className="w-full max-w-3xl mx-auto mb-8 animate-fade-in">
        <h1 className="uppercase tracking-[0.2em] text-xs font-sans text-[var(--text-stone)] mb-2">
          HABITS
        </h1>
        <p className="font-serif italic text-2xl text-[var(--text-ivory)]">
          Manage your commitments.
        </p>
      </div>
      <HabitsManager commitments={commitments} />
    </AppShell>
  );
}
