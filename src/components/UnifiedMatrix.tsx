"use client";

import { useState, useTransition } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  LayoutGrid,
  AlertCircle,
  Lock,
} from "lucide-react";
import { createGoal, deleteGoal, toggleHabitDay, logHabitCell } from "@/app/actions";
import { EmptyState } from "@/components/EmptyState";
import { getEntryDateStatus, getLocalTodayStr, getLocalYesterdayStr } from "@/lib/dateRules";


interface Goal {
  id: string;
  name: string;
  targetMinutes: number;
  active: boolean;
}

interface GoalRecord {
  id: string;
  goalId: string;
  targetMinutes: number;
  actualMinutes: number;
  showedUp: boolean;
}

interface DailyRecord {
  id: string;
  date: string;
  sleepTime?: string | null;
  wakeTime?: string | null;
  phoneMinutes?: number | null;
  reflection?: string | null;
  goals: GoalRecord[];
}

interface UnifiedMatrixProps {
  goals: Goal[];
  records: DailyRecord[];
  currentDateStr: string;
  initialYear: number;
  initialMonthIndex: number;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const FULL_MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function UnifiedMatrix({
  goals,
  records,
  currentDateStr,
  initialYear,
  initialMonthIndex,
}: UnifiedMatrixProps) {
  const [year, setYear] = useState<number>(initialYear);
  const [monthIndex, setMonthIndex] = useState<number>(initialMonthIndex);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("30");
  const [isPendingGoal, startGoalTransition] = useTransition();

  // Optimistic toggles
  const [isPendingToggle, startToggleTransition] = useTransition();
  const [optimisticRecords, setOptimisticRecords] = useState<Record<string, boolean>>({});
  const [matrixFeedback, setMatrixFeedback] = useState<string | null>(null);

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Map of records by `${date}_${goalId}`
  const recordMap = new Map<string, GoalRecord>();
  records.forEach((rec) => {
    rec.goals?.forEach((g) => {
      recordMap.set(`${rec.date}_${g.goalId}`, g);
    });
  });

  const handlePrevMonth = () => {
    if (monthIndex === 0) {
      setMonthIndex(11);
      setYear((y) => y - 1);
    } else {
      setMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (monthIndex === 11) {
      setMonthIndex(0);
      setYear((y) => y + 1);
    } else {
      setMonthIndex((m) => m + 1);
    }
  };

  const handleAddGoal = () => {
    if (!goalName.trim() || !goalTarget) return;
    const formData = new FormData();
    formData.append("name", goalName.trim());
    formData.append("targetMinutes", goalTarget);
    startGoalTransition(async () => {
      await createGoal(formData);
      setGoalName("");
      setGoalTarget("30");
      setIsAddGoalOpen(false);
    });
  };

  const handleToggleCell = (goalId: string, dateStr: string) => {
    const validation = getEntryDateStatus(dateStr);
    if (!validation.allowed) {
      setMatrixFeedback(validation.message);
      setTimeout(() => setMatrixFeedback(null), 4000);
      return;
    }

    const key = `${dateStr}_${goalId}`;
    const rec = recordMap.get(key);
    const current =
      optimisticRecords[key] !== undefined
        ? optimisticRecords[key]
        : rec
        ? rec.showedUp || rec.actualMinutes > 0
        : false;

    setOptimisticRecords((prev) => ({
      ...prev,
      [key]: !current,
    }));

    startToggleTransition(async () => {
      try {
        await toggleHabitDay(goalId, dateStr);
      } catch (err: any) {
        setOptimisticRecords((prev) => ({
          ...prev,
          [key]: current,
        }));
        setMatrixFeedback(err?.message || "Date entry rejected by server.");
        setTimeout(() => setMatrixFeedback(null), 4000);
      }
    });
  };


  return (
    <div className="space-y-6">
      {/* Month Selector Bar */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        {/* Month Title & Prev/Next */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-xl p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded-lg transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 text-xs font-mono font-bold text-zinc-900">
              {FULL_MONTH_NAMES[monthIndex]} {year}
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded-lg transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              const now = new Date();
              setYear(now.getFullYear());
              setMonthIndex(now.getMonth());
            }}
            className="px-3 py-1.5 text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl transition"
          >
            Today
          </button>
        </div>

        {/* 12 Month Quick Selectors */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
          {MONTH_NAMES.map((name, idx) => {
            const isSelected = idx === monthIndex;
            return (
              <button
                key={name}
                onClick={() => setMonthIndex(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-xs font-black"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>

        {/* Add Discipline Button */}
        <button
          onClick={() => setIsAddGoalOpen(!isAddGoalOpen)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-xs whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Discipline</span>
        </button>
      </div>

      {/* Add Discipline Drawer */}
      {isAddGoalOpen && (
        <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600">
              New Habit / Discipline
            </h4>
            <span className="text-xs text-zinc-400">
              Adds a row to your execution grid
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddGoal();
              }}
              placeholder="Habit name (e.g. Boxing, Coding, Reading 20 pages)"
              className="w-full sm:flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-blue-600"
              autoFocus
            />
            <div className="flex w-full sm:w-auto gap-2">
              <input
                type="number"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddGoal();
                }}
                placeholder="Target min (30)"
                className="w-full sm:w-32 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-blue-600 text-right"
              />
              <button
                type="button"
                onClick={handleAddGoal}
                disabled={isPendingGoal || !goalName.trim()}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs whitespace-nowrap transition disabled:opacity-50 shadow-xs"
              >
                {isPendingGoal ? "Adding..." : "Add Habit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Strict Date Feedback Alert */}
      {matrixFeedback && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">{matrixFeedback}</span>
          </div>
          <button
            onClick={() => setMatrixFeedback(null)}
            className="text-amber-700 hover:text-amber-950 font-bold ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* ZERO DATA EMPTY STATE */}
      {goals.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title="No Disciplines in Matrix"
          description="Your monthly execution grid is waiting for your habits. Add a discipline to start tracking daily execution across all 31 days."
          actionLabel="+ Add Your First Discipline"
          onAction={() => setIsAddGoalOpen(true)}
        />
      ) : (
        /* SPREADSHEET MATRIX TABLE */
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full border-collapse text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="sticky left-0 z-20 bg-zinc-50 px-4 py-3 font-bold text-zinc-700 uppercase tracking-wider text-[11px] min-w-[160px] border-r border-zinc-200">
                    Discipline
                  </th>
                  {daysArray.map((day) => {
                    const dayDate = new Date(year, monthIndex, day);
                    const dayName = ["S", "M", "T", "W", "T", "F", "S"][dayDate.getDay()];
                    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const rule = getEntryDateStatus(dateStr);
                    const isToday = rule.status === "today";
                    const isYesterday = rule.status === "yesterday";
                    const isAllowed = rule.allowed;

                    return (
                      <th
                        key={day}
                        className={`text-center px-1 py-2 font-mono text-[11px] min-w-[34px] border-r border-zinc-100 ${
                          isToday
                            ? "bg-blue-50 text-blue-600 font-black border-blue-200"
                            : isYesterday
                            ? "bg-blue-50/50 text-blue-700 font-bold border-blue-100"
                            : !isAllowed
                            ? "text-zinc-400 opacity-60"
                            : "text-zinc-500"
                        }`}
                        title={
                          isToday
                            ? "Today (allowed)"
                            : isYesterday
                            ? "Yesterday (late entry allowed)"
                            : rule.message
                        }
                      >
                        <div className="text-[8px] uppercase font-sans text-zinc-400 font-bold">
                          {isToday ? "TODAY" : isYesterday ? "YDAY" : dayName}
                        </div>
                        <div>{day}</div>
                      </th>
                    );
                  })}
                  <th className="px-3 py-3 text-center font-bold text-zinc-700 uppercase tracking-wider text-[11px] border-l border-zinc-200">
                    Target
                  </th>
                  <th className="px-3 py-3 text-center font-bold text-zinc-700 uppercase tracking-wider text-[11px]">
                    Actual
                  </th>
                  <th className="px-3 py-3 text-center font-bold text-zinc-700 uppercase tracking-wider text-[11px]">
                    Left
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-zinc-700 uppercase tracking-wider text-[11px] min-w-[100px]">
                    %
                  </th>
                  <th className="px-3 py-3 text-center font-bold text-zinc-700 uppercase tracking-wider text-[11px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {goals.map((goal) => {
                  let totalActualMinutes = 0;
                  const totalTargetMinutes = goal.targetMinutes * daysInMonth;

                  daysArray.forEach((day) => {
                    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const key = `${dateStr}_${goal.id}`;
                    const isOptimistic = optimisticRecords[key];
                    const rec = recordMap.get(key);

                    if (isOptimistic !== undefined) {
                      if (isOptimistic) totalActualMinutes += goal.targetMinutes;
                    } else if (rec) {
                      totalActualMinutes += rec.actualMinutes > 0 ? rec.actualMinutes : rec.showedUp ? goal.targetMinutes : 0;
                    }
                  });

                  const habitPct =
                    totalTargetMinutes > 0
                      ? Math.min(100, Math.round((totalActualMinutes / totalTargetMinutes) * 100))
                      : 0;

                  const targetHours = (totalTargetMinutes / 60).toFixed(1);
                  const actualHours = (totalActualMinutes / 60).toFixed(1);
                  const leftHours = Math.max(0, (totalTargetMinutes - totalActualMinutes) / 60).toFixed(1);

                  return (
                    <tr
                      key={goal.id}
                      className="hover:bg-zinc-50/70 transition group"
                    >
                      {/* Fixed Habit Column */}
                      <td className="sticky left-0 z-10 bg-white group-hover:bg-zinc-50 px-4 py-2.5 border-r border-zinc-200">
                        <div className="font-semibold text-xs text-zinc-900 truncate">
                          {goal.name}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400">
                          {goal.targetMinutes}m / day
                        </div>
                      </td>

                      {/* Day Cells */}
                      {daysArray.map((day) => {
                        const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                        const key = `${dateStr}_${goal.id}`;
                        const rec = recordMap.get(key);
                        const isChecked =
                          optimisticRecords[key] !== undefined
                            ? optimisticRecords[key]
                            : rec
                            ? rec.showedUp || rec.actualMinutes > 0
                            : false;
                        const rule = getEntryDateStatus(dateStr);
                        const isAllowed = rule.allowed;
                        const isToday = rule.status === "today";
                        const isYesterday = rule.status === "yesterday";

                        return (
                          <td
                            key={day}
                            onClick={() => handleToggleCell(goal.id, dateStr)}
                            className={`p-1 text-center border-r border-zinc-100 select-none ${
                              !isAllowed
                                ? "cursor-not-allowed bg-zinc-50/50"
                                : "cursor-pointer"
                            } ${isToday ? "bg-blue-50/30" : isYesterday ? "bg-blue-50/15" : ""}`}
                            title={
                              isAllowed
                                ? `${dateStr} (${isToday ? "Today" : "Yesterday — late entry"}): ${
                                    isChecked ? "Completed" : "Click to mark done"
                                  }`
                                : `${dateStr}: Locked (${rule.message})`
                            }
                          >
                            <div
                              className={`w-6 h-6 mx-auto rounded-md flex items-center justify-center transition-all ${
                                isChecked
                                  ? "bg-blue-600 text-white font-bold shadow-xs scale-95"
                                  : !isAllowed
                                  ? "bg-zinc-100 text-zinc-300 opacity-50"
                                  : "bg-zinc-100 text-zinc-300 hover:bg-blue-100 hover:text-blue-600"
                              }`}
                            >
                              {isChecked ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : !isAllowed ? (
                                <span className="text-[9px] text-zinc-300 font-mono">·</span>
                              ) : null}
                            </div>
                          </td>
                        );
                      })}


                      {/* Summary Columns */}
                      <td className="px-3 py-2.5 text-center font-mono font-medium text-zinc-600 border-l border-zinc-200">
                        {targetHours}h
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-blue-600">
                        {actualHours}h
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono text-zinc-400">
                        {leftHours}h
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-zinc-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all duration-300"
                              style={{ width: `${habitPct}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-[11px] text-zinc-700 w-8 text-right">
                            {habitPct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove "${goal.name}"?`)) {
                              startGoalTransition(() => deleteGoal(goal.id));
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-500 rounded transition"
                          title={`Delete ${goal.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
