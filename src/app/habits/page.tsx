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
      <HabitsManager commitments={commitments} />
    </AppShell>
  );
}
