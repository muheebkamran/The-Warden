import { db } from '@/lib/db';
import AppShell from '@/components/AppShell';
import { ReaderView } from '@/components/reader/ReaderView';
import { requireAuth } from '@/app/actions';

export const dynamic = 'force-dynamic';

export default async function ReaderPage() {
  const { userId } = await requireAuth();

  const [books, readCommitment] = await Promise.all([
    db.book.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    }),
    db.commitment.findFirst({
      where: {
        userId,
        isActive: true,
        title: { contains: 'Read', mode: 'insensitive' },
      },
    }),
  ]);

  return (
    <AppShell>
      <ReaderView
        initialBooks={books}
        readTargetMinutes={readCommitment ? Math.round(readCommitment.targetValue) : 30}
      />
    </AppShell>
  );
}
