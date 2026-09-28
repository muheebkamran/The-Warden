"use client";

import { useState, useTransition, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Check,
  PenSquare,
  Sparkles,
  Lock,
  AlertCircle,
} from "lucide-react";
import { toggleHabitDay, addNote, deleteNote, createGoal } from "@/app/actions";
import { EmptyState } from "@/components/EmptyState";
import { getEntryDateStatus, getLocalTodayStr, getLocalYesterdayStr } from "@/lib/dateRules";


interface Goal {
  id: string;
  name: string;
  targetMinutes: number;
  active: boolean;
  createdAt: Date | string;
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
  sleepTime: string | null;
  wakeTime: string | null;
  phoneMinutes: number | null;
  reflection: string | null;
  goals: GoalRecord[];
}

interface NoteItem {
  id: string;
  goalId: string | null;
  content: string;
  createdAt: Date | string;
}

interface HabitifyDashboardProps {
  goals: Goal[];
  records: DailyRecord[];
  notes: NoteItem[];
  currentDateStr: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_OF_WEEK = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function HabitifyDashboard({
  goals,
  records,
  notes,
  currentDateStr,
}: HabitifyDashboardProps) {
  const [selectedGoalId, setSelectedGoalId] = useState<string>(
    goals.length > 0 ? goals[0].id : ""
  );

  const now = new Date(currentDateStr || Date.now());
  const [year, setYear] = useState<number>(now.getFullYear());
  const [monthIndex, setMonthIndex] = useState<number>(now.getMonth());

  // Note creation form
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isAddingNote, startNoteTransition] = useTransition();

  // New Habit modal
  const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitTarget, setNewHabitTarget] = useState("30");
  const [isCreatingHabit, startHabitTransition] = useTransition();

  // Optimistic cell toggling
  const [isPendingToggle, startToggleTransition] = useTransition();
  const [optimisticToggles, setOptimisticToggles] = useState<Record<string, boolean>>({});
  const [dateFeedback, setDateFeedback] = useState<string | null>(null);

  const activeGoal =
    goals.find((g) => g.id === selectedGoalId) || (goals.length > 0 ? goals[0] : null);

  // Map of date_goalId -> GoalRecord
  const recordMap = useMemo(() => {
    const map = new Map<string, GoalRecord>();
    records.forEach((rec) => {
      rec.goals?.forEach((g) => {
        map.set(`${rec.date}_${g.goalId}`, g);
      });
    });
    return map;
  }, [records]);

  // Check if a day is completed for active goal
  const isDayCompleted = (dateStr: string, goalId: string) => {
    const key = `${dateStr}_${goalId}`;
    if (optimisticToggles[key] !== undefined) {
      return optimisticToggles[key];
    }
    const rec = recordMap.get(key);
    if (!rec) return false;
    return rec.showedUp || rec.actualMinutes > 0;
  };

  // Toggle habit day with strict Today & Yesterday validation
  const handleToggleDay = (dateStr: string) => {
    if (!activeGoal) return;

    const validation = getEntryDateStatus(dateStr);
    if (!validation.allowed) {
      setDateFeedback(validation.message);
      setTimeout(() => setDateFeedback(null), 4000);
      return;
    }

    const current = isDayCompleted(dateStr, activeGoal.id);
    const key = `${dateStr}_${activeGoal.id}`;

    setOptimisticToggles((prev) => ({
      ...prev,
      [key]: !current,
    }));

    startToggleTransition(async () => {
      try {
        await toggleHabitDay(activeGoal.id, dateStr);
      } catch (err: any) {
        // Rollback optimistic update on rejection
        setOptimisticToggles((prev) => ({
          ...prev,
          [key]: current,
        }));
        setDateFeedback(err?.message || "Date entry rejected by server.");
        setTimeout(() => setDateFeedback(null), 4000);
      }
    });
  };


  // Month navigation
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

  // Calculate calendar grid days for selected month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, monthIndex, 1);
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();

    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const cells: {
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
    }[] = [];

    // Leading days from previous month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevMonth = monthIndex === 0 ? 11 : monthIndex - 1;
      const prevYear = monthIndex === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === currentDateStr,
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === currentDateStr,
      });
    }

    // Trailing days from next month
    const remaining = 35 - cells.length > 0 ? 35 - cells.length : 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = monthIndex === 11 ? 0 : monthIndex + 1;
      const nextYear = monthIndex === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === currentDateStr,
      });
    }

    return cells;
  }, [year, monthIndex, currentDateStr]);

  // Compute Daily Performance by Day of Week
  const dailyPerformance = useMemo(() => {
    if (!activeGoal) return [0, 0, 0, 0, 0, 0, 0];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    const dayTotals = [0, 0, 0, 0, 0, 0, 0];

    const today = new Date(currentDateStr || Date.now());
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayIdx = (d.getDay() + 6) % 7;
      const dateStr = d.toISOString().split("T")[0];
      dayTotals[dayIdx]++;
      if (isDayCompleted(dateStr, activeGoal.id)) {
        dayCounts[dayIdx]++;
      }
    }

    return dayCounts.map((c, i) =>
      dayTotals[i] > 0 ? Math.round((c / dayTotals[i]) * 100) : 0
    );
  }, [activeGoal, optimisticToggles, recordMap, currentDateStr]);

  // Performance Graph Data (last 8 weeks)
  const graphData = useMemo(() => {
    if (!activeGoal) return [];
    const today = new Date(currentDateStr || Date.now());
    const weeks: { label: string; rate: number }[] = [];

    for (let w = 7; w >= 0; w--) {
      let completedInWeek = 0;
      for (let d = 0; d < 7; d++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - (w * 7 + d));
        const dateStr = checkDate.toISOString().split("T")[0];
        if (isDayCompleted(dateStr, activeGoal.id)) {
          completedInWeek++;
        }
      }
      const rate = Math.round((completedInWeek / 7) * 100);
      weeks.push({
        label: `W${8 - w}`,
        rate,
      });
    }

    return weeks;
  }, [activeGoal, optimisticToggles, recordMap, currentDateStr]);

  const thisWeekRate =
    graphData.length > 0 ? graphData[graphData.length - 1].rate : 0;
  const averageRate = useMemo(() => {
    if (graphData.length === 0) return 0;
    const sum = graphData.reduce((acc, curr) => acc + curr.rate, 0);
    return Math.round(sum / graphData.length);
  }, [graphData]);

  // Compute Streaks timeline breakdown
  const streakPeriods = useMemo(() => {
    if (!activeGoal) return [];
    const today = new Date(currentDateStr || Date.now());
    const days: { dateStr: string; completed: boolean }[] = [];

    for (let i = 59; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      days.push({
        dateStr,
        completed: isDayCompleted(dateStr, activeGoal.id),
      });
    }

    const periods: { startStr: string; endStr: string; length: number }[] = [];
    let currentStreak = 0;
    let startStr = "";

    days.forEach((day, index) => {
      if (day.completed) {
        if (currentStreak === 0) startStr = day.dateStr;
        currentStreak++;
      } else {
        if (currentStreak >= 2) {
          const prevDay = days[index - 1].dateStr;
          periods.push({
            startStr,
            endStr: prevDay,
            length: currentStreak,
          });
        }
        currentStreak = 0;
      }
    });

    if (currentStreak >= 2) {
      periods.push({
        startStr,
        endStr: days[days.length - 1].dateStr,
        length: currentStreak,
      });
    }

    return periods.slice(-4).map((p) => {
      const s = new Date(p.startStr + "T00:00:00");
      const e = new Date(p.endStr + "T00:00:00");
      const format = (d: Date) =>
        d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
      return {
        start: format(s),
        end: format(e),
        days: p.length,
      };
    });
  }, [activeGoal, optimisticToggles, recordMap, currentDateStr]);

  const filteredNotes = useMemo(() => {
    if (!activeGoal) return [];
    return notes.filter((n) => !n.goalId || n.goalId === activeGoal.id);
  }, [notes, activeGoal]);

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;
    const formData = new FormData();
    formData.append("content", newNoteContent.trim());
    if (activeGoal) {
      formData.append("goalId", activeGoal.id);
    }
    startNoteTransition(async () => {
      await addNote(formData);
      setNewNoteContent("");
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
      setIsAddHabitModalOpen(false);
    });
  };

  // SVG Coordinates for line chart
  const svgWidth = 420;
  const svgHeight = 180;
  const paddingX = 35;
  const paddingY = 25;

  const points = useMemo(() => {
    if (graphData.length === 0) return [];
    return graphData.map((d, i) => {
      const x =
        paddingX + (i / (graphData.length - 1)) * (svgWidth - paddingX * 2);
      const y =
        svgHeight - paddingY - (d.rate / 100) * (svgHeight - paddingY * 2);
      return { x, y, rate: d.rate, label: d.label };
    });
  }, [graphData]);

  const pathD = useMemo(() => {
    if (points.length === 0) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, [points]);

  return (
    <div className="flex flex-col flex-1">
      {/* Top Header Bar */}
      <header className="h-16 bg-white border-b border-zinc-200 px-8 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            {activeGoal?.name || "Dashboard"}
          </h1>
          {goals.length > 1 && (
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="text-xs font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg border-none outline-none cursor-pointer"
            >
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.targetMinutes}m)
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-3">
          {activeGoal && (
            <button
              onClick={() => handleToggleDay(currentDateStr)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>
                {isDayCompleted(currentDateStr, activeGoal.id)
                  ? "Done Today"
                  : "Log Today"}
              </span>
            </button>
          )}
          <button
            onClick={() => setIsAddHabitModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 text-white hover:bg-blue-500 rounded-xl text-xs font-semibold transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Discipline</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="p-8 max-w-7xl mx-auto w-full flex-1">
        {/* ZERO DATA INTENTIONAL EMPTY STATE */}
        {goals.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No Disciplines Added Yet"
            description="Commit to your first daily habit. Once created, your performance graph, consistency calendar, streaks, and reflections will populate right here."
            actionLabel="+ Add Your First Discipline"
            onAction={() => setIsAddHabitModalOpen(true)}
          />
        ) : (
          /* 3-COLUMN DASHBOARD (Visual Reference Layout) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* COLUMN 1: Calendar & Daily Performance */}
            <div className="lg:col-span-4 space-y-6">
              {/* Calendar Card */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
                {/* Strict Date Entry Feedback Alert */}
                {dateFeedback && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-medium">{dateFeedback}</span>
                    </div>
                    <button
                      onClick={() => setDateFeedback(null)}
                      className="text-amber-700 hover:text-amber-950 font-bold ml-2 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-zinc-900 text-sm">
                      {MONTH_NAMES[monthIndex]} {year}
                    </h3>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={handlePrevMonth}
                        className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleNextMonth}
                        className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-zinc-400">
                      Today & Y&apos;day only
                    </span>
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      Monthly
                    </span>
                  </div>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {DAYS_OF_WEEK.map((d) => (
                    <span
                      key={d}
                      className="text-[10px] font-bold text-zinc-400 tracking-wider"
                    >
                      {d}
                    </span>
                  ))}
                </div>

                {/* 7-Column Grid */}
                <div className="grid grid-cols-7 gap-1.5 place-items-center">
                  {calendarDays.map((cell, idx) => {
                    const isCompleted = activeGoal
                      ? isDayCompleted(cell.dateStr, activeGoal.id)
                      : false;
                    const dateRule = getEntryDateStatus(cell.dateStr);
                    const isAllowed = dateRule.allowed;
                    const isToday = dateRule.status === "today";
                    const isYesterday = dateRule.status === "yesterday";

                    return (
                      <button
                        key={idx}
                        onClick={() => handleToggleDay(cell.dateStr)}
                        title={
                          isAllowed
                            ? `${cell.dateStr} (${isToday ? "Today" : "Yesterday — late entry"}): ${
                                isCompleted ? "Completed" : "Click to mark done"
                              }`
                            : `${cell.dateStr}: Locked (${dateRule.message})`
                        }
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all relative ${
                          isCompleted
                            ? "bg-blue-600 text-white shadow-xs font-bold hover:scale-105"
                            : !isAllowed
                            ? "bg-zinc-100 text-zinc-400 cursor-not-allowed opacity-50"
                            : cell.isCurrentMonth
                            ? "bg-[#1e2530] text-zinc-200 hover:bg-zinc-700"
                            : "text-zinc-300 hover:bg-zinc-100"
                        } ${
                          isToday
                            ? "ring-2 ring-blue-500 ring-offset-2"
                            : isYesterday
                            ? "border-2 border-dashed border-blue-400"
                            : ""
                        }`}
                      >
                        {String(cell.dayNumber).padStart(2, "0")}
                      </button>
                    );
                  })}
                </div>
              </div>


              {/* Daily Performance Card */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-zinc-900 text-sm">
                    Daily Performance
                  </h4>
                  <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1 cursor-pointer">
                    Complete <ChevronDown className="w-3 h-3" />
                  </span>
                </div>

                <div className="flex items-center justify-between px-1">
                  {DAYS_OF_WEEK.map((dayName, idx) => {
                    const rate = dailyPerformance[idx];
                    const isStrong = rate >= 50;
                    return (
                      <div
                        key={dayName}
                        className="flex flex-col items-center gap-2"
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                            isStrong
                              ? "bg-blue-600 text-white shadow-xs font-bold"
                              : "bg-blue-100 text-blue-800 font-medium"
                          }`}
                          title={`${dayName}: ${rate}% completion`}
                        >
                          <div className="w-2.5 h-2.5 rounded-full bg-current opacity-90" />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 tracking-wider">
                          {dayName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* COLUMN 2: Performance Line Graph & Streaks */}
            <div className="lg:col-span-5 space-y-6">
              {/* Line Graph Card */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Performance Rate
                  </span>
                  <span className="text-xs font-medium text-blue-600">
                    Last 8 Weeks
                  </span>
                </div>

                <div className="w-full relative overflow-hidden">
                  <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="w-full h-44 overflow-visible"
                  >
                    {[100, 66, 33, 0].map((val) => {
                      const y =
                        svgHeight -
                        paddingY -
                        (val / 100) * (svgHeight - paddingY * 2);
                      return (
                        <g key={val}>
                          <line
                            x1={paddingX}
                            y1={y}
                            x2={svgWidth - paddingX}
                            y2={y}
                            stroke="#e5e7eb"
                            strokeDasharray="4 4"
                            strokeWidth="1"
                          />
                          <text
                            x={paddingX - 8}
                            y={y + 3}
                            fontSize="9"
                            fill="#9ca3af"
                            textAnchor="end"
                            fontFamily="monospace"
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}

                    {pathD && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {points.map((p, idx) => (
                      <g key={idx} className="group cursor-pointer">
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="4.5"
                          fill="#2563eb"
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="transition-transform group-hover:scale-125"
                        />
                        <title>{`${p.label}: ${p.rate}%`}</title>
                      </g>
                    ))}

                    {points.map((p, idx) => (
                      <text
                        key={idx}
                        x={p.x}
                        y={svgHeight - 4}
                        fontSize="9"
                        fill="#9ca3af"
                        textAnchor="middle"
                        fontWeight="500"
                      >
                        {p.label}
                      </text>
                    ))}
                  </svg>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-zinc-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                      THIS WEEK
                    </span>
                    <span className="text-2xl font-black text-zinc-900 tracking-tight">
                      {thisWeekRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                      AVERAGE
                    </span>
                    <span className="text-2xl font-black text-zinc-900 tracking-tight">
                      {averageRate}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Streaks Timeline Card */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs">
                <h4 className="font-bold text-zinc-900 text-sm mb-4">
                  Streak
                </h4>

                <div className="space-y-3">
                  {streakPeriods.length > 0 ? (
                    streakPeriods.map((period, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-zinc-500 font-medium w-16 text-left">
                          {period.start}
                        </span>
                        <div className="flex-1 px-4 flex justify-center">
                          <div
                            className="bg-blue-600 text-white font-bold px-4 py-1 rounded-md text-xs shadow-xs text-center min-w-16"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(25, period.days * 8)
                              )}%`,
                            }}
                          >
                            {period.days}
                          </div>
                        </div>
                        <span className="text-zinc-500 font-medium w-16 text-right">
                          {period.end}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-400 text-center py-4">
                      Complete consecutive days to unlock your streak timeline!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* COLUMN 3: Notes Journal (Highlighted in Cyan) */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white rounded-2xl border-2 border-cyan-400 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-zinc-900 text-sm flex items-center gap-1.5">
                    <PenSquare className="w-4 h-4 text-cyan-600" />
                    <span>Notes</span>
                  </h4>
                  <span className="text-[10px] font-mono text-cyan-600 font-bold">
                    {filteredNotes.length} entries
                  </span>
                </div>

                {/* Add Note Input */}
                <div className="mb-4">
                  <textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Log reflections or reasons for skips..."
                    rows={2}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-cyan-500 text-zinc-800 placeholder-zinc-400 resize-none"
                  />
                  <div className="flex justify-end mt-1.5">
                    <button
                      onClick={handleAddNote}
                      disabled={isAddingNote || !newNoteContent.trim()}
                      className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition shadow-xs"
                    >
                      {isAddingNote ? "Saving..." : "Add Note"}
                    </button>
                  </div>
                </div>

                {/* Chronological Notes Feed */}
                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
                  {filteredNotes.length > 0 ? (
                    filteredNotes.map((note) => {
                      const noteDate = new Date(note.createdAt);
                      const formattedDate = noteDate.toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        }
                      );

                      return (
                        <div
                          key={note.id}
                          className="border-b border-zinc-100 pb-3 last:border-none group"
                        >
                          <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                            <span>{formattedDate}</span>
                            <button
                              onClick={() => deleteNote(note.id)}
                              className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition"
                              title="Delete note"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-xs text-zinc-800 font-medium leading-relaxed">
                            {note.content}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-zinc-400 text-center py-6">
                      No notes yet. Add reflections or reasons for skips above!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Habit Modal */}
      {isAddHabitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-zinc-200">
            <h3 className="font-bold text-base text-zinc-900 mb-1">
              Add New Discipline
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Commit to a daily measurable standard.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                  Discipline Name
                </label>
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g. Read 20 pages, Deep Work, Boxing"
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-blue-600 text-zinc-900"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                  Target Minutes / Day
                </label>
                <input
                  type="number"
                  value={newHabitTarget}
                  onChange={(e) => setNewHabitTarget(e.target.value)}
                  placeholder="30"
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-blue-600 text-zinc-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setIsAddHabitModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateHabit}
                disabled={isCreatingHabit || !newHabitName.trim()}
                className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 transition shadow-sm"
              >
                {isCreatingHabit ? "Adding..." : "Add Discipline"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
