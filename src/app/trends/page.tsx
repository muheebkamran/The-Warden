import { db } from "@/lib/db";
import { AppLayout } from "@/components/AppLayout";
import { UnifiedTrends } from "@/components/UnifiedTrends";

import { getUserSettings } from "@/app/actions";

export const dynamic = "force-dynamic";

function parseSleepDuration(sleepStr?: string | null, wakeStr?: string | null): number | null {
  if (!sleepStr || !wakeStr) return null;
  try {
    const parseTime = (str: string) => {
      const match = str.trim().match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
      if (!match) return null;
      let hours = parseInt(match[1], 10);
      const mins = parseInt(match[2], 10);
      const ampm = match[3]?.toLowerCase();
      if (ampm === "pm" && hours < 12) hours += 12;
      if (ampm === "am" && hours === 12) hours = 0;
      return hours + mins / 60;
    };

    const s = parseTime(sleepStr);
    const w = parseTime(wakeStr);
    if (s === null || w === null) return null;

    let diff = w - s;
    if (diff < 0) diff += 24;
    return Number(diff.toFixed(1));
  } catch {
    return null;
  }
}

export default async function TrendsPage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();

  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const monthPrefix = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, "0")}`;
  const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const [goals, allRecords, userSettings] = await Promise.all([
    db.goal.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } }),
    db.dailyRecord.findMany({
      include: { goals: true },
      orderBy: { date: "asc" },
    }),
    getUserSettings(),
  ]);

  const trendData = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dayStr = String(dayNum).padStart(2, "0");
    const dateStr = `${monthPrefix}-${dayStr}`;

    const rec = allRecords.find((r) => r.date === dateStr);
    let habitsCompleted = 0;
    let focusMinutes = 0;

    if (rec) {
      rec.goals.forEach((g) => {
        focusMinutes += g.actualMinutes;
        const target = goals.find((item) => item.id === g.goalId)?.targetMinutes ?? 0;
        if (g.showedUp || (target > 0 && g.actualMinutes >= target)) {
          habitsCompleted++;
        }
      });
    }

    const phoneMinutes = rec?.phoneMinutes ?? 0;
    const sleepHours = parseSleepDuration(rec?.sleepTime, rec?.wakeTime);

    return {
      day: dayStr,
      date: dateStr,
      habitsCompleted,
      focusHours: Number((focusMinutes / 60).toFixed(1)),
      phoneHours: Number((phoneMinutes / 60).toFixed(1)),
      sleepHours,
    };
  });

  return (
    <AppLayout goals={goals} userSettings={userSettings}>
      <UnifiedTrends data={trendData} monthLabel={monthLabel} />
    </AppLayout>
  );
}
