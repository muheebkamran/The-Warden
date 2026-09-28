"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Plus,
  Flame,
  ArrowRight,
  ShieldCheck,
  LayoutGrid,
  TrendingUp,
  Clock,
  Sparkles,
  Lock,
  ChevronRight,
  BookOpen,
  Calendar,
  AlertCircle,
  Check,
} from "lucide-react";
import { toggleHabitDay, createGoal, keepPromise } from "@/app/actions";
import { getLocalTodayStr, getLocalYesterdayStr, getEntryDateStatus } from "@/lib/dateRules";
import { WelcomeGreeting } from "@/components/WelcomeGreeting";

interface Goal {
  id: string;
  name: string;
  targetMinutes: number;
  active: boolean;
  createdAt: Date | string;
}

interface GoalRecord {
  id: string;
  dailyRecordId: string;
  goalId: string;
  targetMinutes: number;
  actualMinutes: number;
  showedUp: boolean;
}

interface DailyRecord {
  id: string;
  date: string;
  goals: GoalRecord[];
}

interface PromiseItem {
  id: string;
  date: string;
  text: string;
  targetMinutes: number | null;
  status: string;
  actualMinutes: number;
  keptAt: Date | string | null;
}

interface IdentityStats {
  longestStreak: number;
  totalPromised: number;
  totalKept: number;
}

interface HomeCommandCenterProps {
  goals: Goal[];
  records: DailyRecord[];
  promises: PromiseItem[];
  identityStats: IdentityStats | null;
  userName: string;
  currentDateStr: string;
}

export function HomeCommandCenter({
  goals,
  records,
  promises,
  identityStats,
  userName = "Muheeb",
  currentDateStr,
}: HomeCommandCenterProps) {
  const todayStr = currentDateStr || getLocalTodayStr();
  const yesterdayStr = getLocalYesterdayStr();

  // Active view date: user can select Today or Yesterday (strict rule)
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Optimistic completion tracking: Record<`${goalId}_${date}`, boolean>
  const [optimisticOverrides, setOptimisticOverrides] = useState<Record<string, boolean>>({});
  const [isToggling, startToggleTransition] = useTransition();

  // Add Habit modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitTarget, setNewHabitTarget] = useState("30");
  const [isAddingHabit, startHabitTransition] = useTransition();

  // Date validation status
  const dateValidation = useMemo(
    () => getEntryDateStatus(selectedDate),
    [selectedDate]
  );

  // Map of completed goals for selectedDate
  const currentRecord = records.find((r) => r.date === selectedDate);
  const completionMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    if (currentRecord) {
      for (const gr of currentRecord.goals) {
        if (gr.showedUp || gr.actualMinutes > 0) {
          map[gr.goalId] = true;
        }
      }
    }
    // Apply optimistic local overrides
    for (const [key, val] of Object.entries(optimisticOverrides)) {
      if (key.endsWith(`_${selectedDate}`)) {
        const goalId = key.replace(`_${selectedDate}`, "");
        map[goalId] = val;
      }
    }
    return map;
  }, [currentRecord, selectedDate, optimisticOverrides]);

  // Statistics calculation for the selected date
  const totalGoalsCount = goals.length;
  const completedGoalsCount = goals.filter((g) => !!completionMap[g.id]).length;
  const remainingGoalsCount = Math.max(0, totalGoalsCount - completedGoalsCount);
  const progressPercent =
    totalGoalsCount > 0
      ? Math.round((completedGoalsCount / totalGoalsCount) * 100)
      : 0;

  // Active promises for today
  const todayPromises = promises.filter((p) => p.date === todayStr);
  const keptPromisesCount = todayPromises.filter((p) => p.status === "kept").length;

  const handleToggleHabit = (goalId: string) => {
    if (!dateValidation.allowed) return;

    const currentStatus = !!completionMap[goalId];
    const newStatus = !currentStatus;
    const overrideKey = `${goalId}_${selectedDate}`;

    // 1. Instant optimistic state update
    setOptimisticOverrides((prev) => ({ ...prev, [overrideKey]: newStatus }));

    // 2. Server mutation
    startToggleTransition(async () => {
      try {
        await toggleHabitDay(goalId, selectedDate);
      } catch (err) {
        // Rollback on failure
        setOptimisticOverrides((prev) => ({ ...prev, [overrideKey]: currentStatus }));
      }
    });
  };

  const handleCreateHabit = () => {
    if (!newHabitName.trim()) return;
    const formData = new FormData();
    formData.append("name", newHabitName.trim());
    formData.append("targetMinutes", newHabitTarget || "30");

    startHabitTransition(async () => {
      await createGoal(formData);
      setNewHabitName("");
      setNewHabitTarget("30");
      setIsAddModalOpen(false);
    });
  };

  // Motivational message based on progress
  const progressMessage = useMemo(() => {
    if (totalGoalsCount === 0) return "Add your first discipline to begin.";
    if (remainingGoalsCount === 0) return "All daily goals completed! Outstanding standard.";
    if (completedGoalsCount === 0) return "Ready to start today's disciplines.";
    if (remainingGoalsCount === 1) return "Almost done! Only 1 more daily goal to go.";
    return `Your daily goals almost done! ${remainingGoalsCount} more to go.`;
  }, [totalGoalsCount, remainingGoalsCount, completedGoalsCount]);

  return (
    <>
      {/* Personalized Welcome Greeting (auto-dismissing micro-interaction) */}
      <WelcomeGreeting name={userName} />

      <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-app,#f4f6fa)]">
        {/* Top Header Command Bar */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-6 sm:px-8 py-4 sticky top-0 z-20 transition-colors">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-main,#0f172a)]">
                  Command Center
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--brand,#2563eb)]/10 text-[var(--brand,#2563eb)] border border-[var(--brand,#2563eb)]/20">
                  Daily Execution
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted,#64748b)] mt-0.5 font-medium">
                Keep your word. What you do today defines who you become.
              </p>
            </div>

            {/* Strict Date Selector: Today & Yesterday ONLY */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
              <button
                onClick={() => setSelectedDate(yesterdayStr)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  selectedDate === yesterdayStr
                    ? "bg-white dark:bg-slate-700 text-[var(--brand,#2563eb)] shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
                title="Yesterday (Late Entry Allowed)"
              >
                Yesterday
              </button>
              <button
                onClick={() => setSelectedDate(todayStr)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  selectedDate === todayStr
                    ? "bg-[var(--brand,#2563eb)] text-[var(--brand-text,#ffffff)] shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Today
              </button>
              <div
                className="px-2.5 py-1.5 rounded-lg font-medium text-slate-400 dark:text-slate-500 cursor-not-allowed flex items-center gap-1 text-[11px]"
                title="Future dates are strictly locked. You can only enter today or yesterday."
              >
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Tomorrow</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="p-6 sm:p-8 max-w-5xl mx-auto w-full flex-1 space-y-6">
          {/* Active Date Context Notice if Yesterday */}
          {selectedDate === yesterdayStr && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 text-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Viewing <strong>Yesterday ({yesterdayStr})</strong> — Late entry window is active.
                </span>
              </div>
              <button
                onClick={() => setSelectedDate(todayStr)}
                className="font-bold underline hover:no-underline text-amber-900 dark:text-amber-100 text-xs"
              >
                Return to Today
              </button>
            </div>
          )}

          {/* ─── Hero Card: "My Daily Goals" Overview ──────────────────────────────── */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 dark:border-slate-800 relative overflow-hidden transition-all">
            {/* Background subtle radial glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--brand,#2563eb)]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[var(--brand,#2563eb)]">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      My Daily Goals
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-main,#0f172a)] tracking-tight">
                    {progressMessage}
                  </h2>
                  <p className="text-xs text-[var(--text-muted,#64748b)]">
                    {selectedDate === todayStr ? "Today's" : "Yesterday's"} accountability progress:{" "}
                    <strong className="text-[var(--text-main,#0f172a)] font-bold">{completedGoalsCount} of {totalGoalsCount} completed</strong> ({progressPercent}%)
                  </p>
                </div>

                {/* Progress Pill Metric Display */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div className="text-left">
                      <p className="text-base font-black leading-none">{completedGoalsCount}</p>
                      <p className="text-[10px] font-semibold uppercase text-emerald-600 dark:text-emerald-400 mt-0.5">Done</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                    <Circle className="w-4 h-4 text-slate-400" />
                    <div className="text-left">
                      <p className="text-base font-black leading-none">{remainingGoalsCount}</p>
                      <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 mt-0.5">Remaining</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar with smooth animation */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Completion Rate</span>
                  <span className="text-[var(--brand,#2563eb)] font-mono text-sm">{progressPercent}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
                  <div
                    className="h-full bg-[var(--brand,#2563eb)] rounded-full transition-all duration-500 ease-out shadow-xs"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ─── Goals Checklist: Direct Interactive Execution ──────────────────────── */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-main,#0f172a)] uppercase tracking-wide">
                  Daily Disciplines ({goals.length})
                </h3>
                <p className="text-xs text-[var(--text-muted,#64748b)]">
                  Click to mark showed-up. Changes sync instantly across the entire system.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/habits"
                  className="text-xs font-bold text-[var(--brand,#2563eb)] hover:underline flex items-center gap-1"
                >
                  <span>Manage in Habits</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--brand,#2563eb)] text-[var(--brand-text,#ffffff)] hover:opacity-90 transition text-xs font-bold shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Discipline</span>
                </button>
              </div>
            </div>

            {goals.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-[var(--text-main,#0f172a)]">
                  No Disciplines Configured Yet
                </h4>
                <p className="text-xs text-[var(--text-muted,#64748b)] max-w-sm mx-auto">
                  Your daily habits form the core of your personal accountability. Add what you commit to do every day.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand,#2563eb)] text-[var(--brand-text,#ffffff)] font-bold text-xs rounded-xl shadow-sm hover:opacity-90 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Your First Discipline</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {goals.map((goal) => {
                  const isCompleted = !!completionMap[goal.id];

                  return (
                    <div
                      key={goal.id}
                      onClick={() => handleToggleHabit(goal.id)}
                      className={`group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
                        isCompleted
                          ? "bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60 shadow-xs"
                          : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Circular Checkbox Micro-Interaction */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleHabit(goal.id);
                          }}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-150 active:scale-90 border ${
                            isCompleted
                              ? "bg-[var(--brand,#2563eb)] border-[var(--brand,#2563eb)] text-[var(--brand-text,#ffffff)] shadow-xs scale-100"
                              : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-transparent hover:border-slate-400 group-hover:scale-105"
                          }`}
                          aria-label={`Mark ${goal.name} as ${isCompleted ? "incomplete" : "complete"}`}
                        >
                          <Check
                            className={`w-4 h-4 stroke-[3] transition-all duration-200 ${
                              isCompleted ? "scale-100 opacity-100" : "scale-50 opacity-0"
                            }`}
                          />
                        </button>

                        <div className="min-w-0">
                          <p
                            className={`text-sm font-bold truncate transition-colors ${
                              isCompleted
                                ? "text-slate-800 dark:text-slate-100 line-through opacity-85"
                                : "text-slate-900 dark:text-slate-100"
                            }`}
                          >
                            {goal.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--text-muted,#64748b)]">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>{goal.targetMinutes} min target</span>
                            {isCompleted && (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                • Done
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${
                            isCompleted
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {isCompleted ? "Kept" : "Pending"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ─── Secondary Cards: Promise Vault & Quick Navigation ──────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Promise Vault Snapshot */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-main,#0f172a)] uppercase tracking-wide">
                      Promise Vault
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted,#64748b)]">
                      Keep your word snapshot
                    </p>
                  </div>
                </div>
                <Link
                  href="/vault"
                  className="text-xs font-bold text-[var(--brand,#2563eb)] hover:underline flex items-center gap-1"
                >
                  <span>Open Vault</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {todayPromises.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center text-xs text-slate-500">
                  <p>No specific promises committed for today yet.</p>
                  <Link
                    href="/vault"
                    className="text-[var(--brand,#2563eb)] font-bold hover:underline inline-block mt-1"
                  >
                    + Make a Promise in Vault
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayPromises.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <div className="truncate mr-2">
                        <p className={`font-semibold truncate ${p.status === "kept" ? "line-through text-slate-500" : "text-slate-800 dark:text-slate-200"}`}>
                          {p.text}
                        </p>
                        {p.targetMinutes && (
                          <p className="text-[10px] text-slate-400 font-mono">
                            {p.targetMinutes}m target
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                        p.status === "kept"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Deep-Dive Navigation */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[var(--brand,#2563eb)] flex items-center justify-center font-bold">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-main,#0f172a)] uppercase tracking-wide">
                    Accountability Views
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted,#64748b)]">
                    Direct access to specialized sections
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link
                  href="/matrix"
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-slate-200/60 dark:border-slate-700 transition flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold group-hover:text-[var(--brand,#2563eb)]">
                    <span>Habit Matrix</span>
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">31-day spreadsheet</span>
                </Link>

                <Link
                  href="/dashboard"
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-slate-200/60 dark:border-slate-700 transition flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold group-hover:text-[var(--brand,#2563eb)]">
                    <span>Analytics</span>
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">Charts & debriefs</span>
                </Link>

                <Link
                  href="/reader"
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-slate-200/60 dark:border-slate-700 transition flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold group-hover:text-[var(--brand,#2563eb)]">
                    <span>Reading Room</span>
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">PDF & page memory</span>
                </Link>

                <Link
                  href="/settings"
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-slate-200/60 dark:border-slate-700 transition flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold group-hover:text-[var(--brand,#2563eb)]">
                    <span>Settings</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">Name & custom theme</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Discipline Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">
              Add New Daily Discipline
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Commit to a measurable standard every single day.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Discipline Name
                </label>
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateHabit();
                  }}
                  placeholder="e.g. Read 20 pages, Deep Work, Boxing"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-[var(--brand,#2563eb)] text-slate-900 dark:text-slate-100"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Target Minutes / Day
                </label>
                <input
                  type="number"
                  value={newHabitTarget}
                  onChange={(e) => setNewHabitTarget(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateHabit();
                  }}
                  placeholder="30"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-[var(--brand,#2563eb)] text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateHabit}
                disabled={isAddingHabit || !newHabitName.trim()}
                className="px-4 py-2 text-xs font-bold bg-[var(--brand,#2563eb)] text-[var(--brand-text,#ffffff)] rounded-xl hover:opacity-90 disabled:opacity-50 transition shadow-sm"
              >
                {isAddingHabit ? "Adding..." : "Add Discipline"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
