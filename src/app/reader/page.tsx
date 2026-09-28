import { db } from "@/lib/db";
import { AppLayout } from "@/components/AppLayout";
import { UnifiedReader } from "@/components/UnifiedReader";

import { getUserSettings } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function ReaderPage() {
  const [goals, books, userSettings] = await Promise.all([
    db.goal.findMany({
      where: { active: true },
      orderBy: { createdAt: "asc" },
    }),
    db.book.findMany({
      orderBy: { updatedAt: "desc" },
    }),
    getUserSettings(),
  ]);

  return (
    <AppLayout goals={goals} userSettings={userSettings}>
      <UnifiedReader books={books} />
    </AppLayout>
  );
}
