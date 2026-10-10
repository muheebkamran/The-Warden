import { db } from "@/lib/db";
import AppShell from "@/components/AppShell";
import { FinanceDashboard } from "@/components/finance/FinanceDashboard";
import { requireAuth } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const { userId } = await requireAuth();

  const [profile, transactions, bills, goals, locks] = await Promise.all([
    db.financeProfile.findUnique({
      where: { userId },
    }),
    db.transaction.findMany({
      where: { userId },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 200,
    }),
    db.bill.findMany({
      where: { userId },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 100,
    }),
    db.financialGoal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    db.impulseLock.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <AppShell>
      <FinanceDashboard
        initialProfile={profile}
        transactions={transactions}
        bills={bills}
        goals={goals}
        locks={locks}
      />
    </AppShell>
  );
}
