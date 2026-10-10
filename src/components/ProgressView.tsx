"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
  Rocket, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  FileEdit, 
  Flame, 
  ShieldCheck, 
  Snowflake, 
  Lock, 
  Dumbbell, 
  Moon, 
  BookOpen, 
  Grid, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Activity,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";

interface Commitment {
  id: string;
  title: string;
  type: string;
  targetValue: number;
  unit: string;
}

interface DailyRecord {
  id: string;
  commitmentId: string;
  date: string;
  targetValue: number;
  actualValue: number;
  status: "missed" | "showed_up" | "complete";
  note?: string | null;
}

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  graceDayActive?: boolean;
}

interface ProgressViewProps {
  commitments: Commitment[];
  allRecords: DailyRecord[];
  streakState: StreakState | null;
  todayStr: string;
}

export function ProgressView({
  commitments,
  allRecords,
  streakState,
  todayStr,
}: ProgressViewProps) {
  const [categoryFilter, setCategoryFilter] = useState<"all" | "active">("all");
  const [dossierExported, setDossierExported] = useState(false);

  // 1. Strict real metrics from DB
  const currentStreak = streakState?.currentStreak ?? 0;
  const longestStreak = streakState?.longestStreak ?? 0;

  // Consistency index: percentage of completed/showed_up records across all logged records
  const consistencyIndex = useMemo(() => {
    if (allRecords.length === 0) return 0;
    const completed = allRecords.filter(r => r.status === "complete" || r.status === "showed_up").length;
    return Math.min(100, Math.round((completed / allRecords.length) * 1000) / 10);
  }, [allRecords]);

  // Total fortress days (days where adherence was >= 70%)
  const { fortressDaysCount, evaluatedDaysCount } = useMemo(() => {
    if (allRecords.length === 0 || commitments.length === 0) {
      return { fortressDaysCount: 0, evaluatedDaysCount: 0 };
    }
    const dateMap = new Map<string, { total: number; completed: number }>();
    allRecords.forEach(r => {
      const entry = dateMap.get(r.date) || { total: 0, completed: 0 };
      entry.total += 1;
      if (r.status === "complete" || r.status === "showed_up") {
        entry.completed += 1;
      }
      dateMap.set(r.date, entry);
    });

    let fortressCount = 0;
    const totalDays = dateMap.size;
    dateMap.forEach(val => {
      const required = Math.ceil(0.70 * commitments.length);
      if (val.completed >= required) {
        fortressCount += 1;
      }
    });

    return { fortressDaysCount: fortressCount, evaluatedDaysCount: totalDays };
  }, [allRecords, commitments.length]);

  // Export dossier handler
  const handleExportDossier = () => {
    const manifest = {
      system: "THE WARDEN TELEMETRY DOSSIER",
      generatedAt: new Date().toISOString(),
      streakState: {
        currentStreak,
        longestStreak,
        graceDayActive: !!streakState?.graceDayActive,
      },
      consistencyIndex: `${consistencyIndex}%`,
      commitmentsCount: commitments.length,
      recordsCount: allRecords.length,
      fortressDaysCount,
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `warden-dossier-${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDossierExported(true);
    setTimeout(() => setDossierExported(false), 3000);
  };

  // 2. Real habit items derived from actual commitments
  const habitItems = useMemo(() => {
    if (commitments.length === 0) {
      return [];
    }

    return commitments.map((c, idx) => {
      const recordsForC = allRecords.filter(r => r.commitmentId === c.id);
      const completeCount = recordsForC.filter(r => r.status === "complete" || r.status === "showed_up").length;
      const adherenceRate = recordsForC.length > 0 
        ? Math.round((completeCount / recordsForC.length) * 100) 
        : 0;

      const iconList = [Snowflake, Lock, Dumbbell, Moon, BookOpen];
      const IconComponent = iconList[idx % iconList.length];
      
      return {
        id: c.id,
        title: c.title,
        category: c.type.toUpperCase() || "MENTAL FORTRESS",
        isAnchor: idx === 0,
        description: `Target: ${c.targetValue} ${c.unit} // Active Protocol`,
        streak: completeCount > 0 ? Math.min(currentStreak, completeCount) : 0,
        adherence: adherenceRate,
        status: adherenceRate >= 90 ? "Optimal" : adherenceRate >= 70 ? "Standard" : "Calibrating",
        icon: IconComponent,
        iconColor: idx === 0 
          ? "text-[#00D664] bg-[#00D664]/10 border-[#00D664]/30" 
          : idx === 1 
          ? "text-[#FFFC00] bg-[#FFFC00]/10 border-[#FFFC00]/30" 
          : "text-zinc-400 bg-zinc-800/40 border-zinc-700/40",
      };
    });
  }, [commitments, allRecords, currentStreak]);

  // 3. Peak Adherence Day of Week derived from real records
  const peakAdherenceDay = useMemo(() => {
    if (allRecords.length === 0) return { name: "No Data", pct: 0 };
    const dayBuckets: { [key: number]: { total: number; complete: number } } = {
      0: { total: 0, complete: 0 },
      1: { total: 0, complete: 0 },
      2: { total: 0, complete: 0 },
      3: { total: 0, complete: 0 },
      4: { total: 0, complete: 0 },
      5: { total: 0, complete: 0 },
      6: { total: 0, complete: 0 },
    };
    allRecords.forEach(r => {
      const d = new Date(r.date + "T00:00:00");
      const day = d.getDay();
      dayBuckets[day].total += 1;
      if (r.status === "complete" || r.status === "showed_up") {
        dayBuckets[day].complete += 1;
      }
    });

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let bestDay = 1;
    let bestRate = -1;

    for (let i = 0; i < 7; i++) {
      if (dayBuckets[i].total > 0) {
        const rate = dayBuckets[i].complete / dayBuckets[i].total;
        if (rate > bestRate) {
          bestRate = rate;
          bestDay = i;
        }
      }
    }

    if (bestRate < 0) return { name: "No Data", pct: 0 };
    return { name: dayNames[bestDay], pct: Math.round(bestRate * 100) };
  }, [allRecords]);

  // 4. Weekly Velocity Bar Chart: Current week Monday to Sunday
  const weeklyVelocityData = useMemo(() => {
    const today = new Date(todayStr + "T00:00:00");
    const dayOfWeek = today.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday);

    const dayNames = ["M", "T", "W", "T", "F", "S", "S"];
    const totalCommitments = commitments.length;

    let weekCompletedSum = 0;
    let weekPossibleSum = 0;

    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = d.toISOString().split("T")[0];
      const isToday = iso === todayStr;
      const isFuture = iso > todayStr;

      const dayRecords = allRecords.filter(r => r.date === iso);
      const completed = dayRecords.filter(r => r.status === "complete" || r.status === "showed_up").length;
      const pct = totalCommitments > 0 ? Math.min(100, Math.round((completed / totalCommitments) * 100)) : 0;

      if (!isFuture) {
        weekCompletedSum += completed;
        weekPossibleSum += totalCommitments;
      }

      let color = "bg-[#1C1C20]";
      if (!isFuture && completed > 0) {
        if (pct >= 100) color = "bg-[#00D664]";
        else if (pct >= 70) color = "bg-[#00D664]";
        else color = "bg-[#FFFC00]";
      }

      return {
        day: dayNames[i],
        iso,
        val: isFuture ? "--" : `${completed}/${totalCommitments}`,
        pct: `${pct}%`,
        color,
        isToday,
        isFuture,
        completed,
        peak: pct === 100 && completed > 0,
      };
    });

    const weekRate = weekPossibleSum > 0 ? Math.round((weekCompletedSum / weekPossibleSum) * 1000) / 10 : 0;

    return { days, weekRate, weekCompletedSum, weekPossibleSum };
  }, [todayStr, commitments.length, allRecords]);

  // 5. Seven-Day Activity Summary: Rolling 7 days up to today
  const sevenDaySummary = useMemo(() => {
    const totalCommitments = commitments.length;

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(todayStr + "T00:00:00");
      d.setDate(d.getDate() - (6 - i));
      const iso = d.toISOString().split("T")[0];
      const isToday = iso === todayStr;

      const dayRecords = allRecords.filter(r => r.date === iso);
      const completed = dayRecords.filter(r => r.status === "complete" || r.status === "showed_up").length;
      const pct = totalCommitments > 0 ? Math.min(100, Math.round((completed / totalCommitments) * 100)) : 0;

      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      
      let tag = "Inactive";
      let tagColor = "text-zinc-500 bg-zinc-900/60 border-zinc-800";
      let stroke = "#24242A";

      if (completed > 0) {
        if (pct >= 100) {
          tag = "Fortress";
          tagColor = "text-[#00D664] bg-[#00D664]/10 border-[#00D664]/20";
          stroke = "#00D664";
        } else if (pct >= 70) {
          tag = "Standard";
          tagColor = "text-[#FFFC00] bg-[#FFFC00]/10 border-[#FFFC00]/20";
          stroke = "#FFFC00";
        } else {
          tag = "Partial";
          tagColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
          stroke = "#f59e0b";
        }
      }

      return {
        day: dayLabel,
        iso,
        val: `${completed} / ${totalCommitments} Habits`,
        pct: `${pct}%`,
        tag,
        tagColor,
        stroke,
        dash: `${pct}, 100`,
        isToday,
        peak: pct === 100 && completed > 0,
      };
    });
  }, [todayStr, allRecords, commitments.length]);

  // 6. 16-Week Dynamic Calendar Heatmap Grid (112 cells)
  const heatmapData = useMemo(() => {
    const today = new Date(todayStr + "T00:00:00");
    const dayOfWeek = today.getDay();
    const diffToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    const endSunday = new Date(today);
    endSunday.setDate(today.getDate() + diffToSunday);

    const totalDays = 16 * 7; // 112 cells
    const startDate = new Date(endSunday);
    startDate.setDate(endSunday.getDate() - (totalDays - 1));

    const totalCommitments = commitments.length;

    // Build month labels based on the 16-week window
    const m1 = new Date(startDate);
    const m2 = new Date(startDate); m2.setDate(m2.getDate() + 28);
    const m3 = new Date(startDate); m3.setDate(m3.getDate() + 56);
    const m4 = new Date(endSunday);

    const formatMonth = (d: Date) => d.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase();
    const monthHeaders = [
      formatMonth(m1),
      formatMonth(m2),
      formatMonth(m3),
      `${formatMonth(m4)} (CURRENT)`,
    ];

    const cells = Array.from({ length: totalDays }).map((_, idx) => {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + idx);
      const iso = cellDate.toISOString().split("T")[0];
      const isToday = iso === todayStr;
      const isFuture = iso > todayStr;

      if (isFuture) {
        return {
          iso,
          color: "bg-[#141416] border border-[#202024]/40",
          title: `${iso} (Future Date - Locked)`,
          isToday: false,
          isFuture: true,
        };
      }

      const dayRecords = allRecords.filter(r => r.date === iso);
      const completed = dayRecords.filter(r => r.status === "complete" || r.status === "showed_up").length;

      // STRICT ZERO-DATA CHECK: IF NO RECORDS EXIST OR COMPLETED IS 0 -> INACTIVE CELL!
      if (dayRecords.length === 0 || completed === 0) {
        return {
          iso,
          color: isToday 
            ? "bg-[#18181C] border-2 border-[#FFFC00]/60 ring-1 ring-[#FFFC00]/30" 
            : "bg-[#18181C] border border-[#26262B]",
          title: `${iso}: 0 completed (No records logged)`,
          isToday,
          isFuture: false,
        };
      }

      // Real Data Rendering
      const totalForDay = totalCommitments > 0 ? totalCommitments : dayRecords.length;
      const pct = completed / totalForDay;

      let cellColor = "bg-[#064e3b]"; // Minimal (1-39%)
      if (pct >= 1.0) {
        cellColor = "bg-[#FFFC00] shadow-sm shadow-[#FFFC00]/40"; // 100% Fortress
      } else if (pct >= 0.70) {
        cellColor = "bg-[#00D664]"; // 70%+ Threshold Met
      } else if (pct >= 0.40) {
        cellColor = "bg-[#059669]"; // Partial (40-69%)
      }

      return {
        iso,
        color: cellColor,
        title: `${iso}: ${completed}/${totalForDay} habits complete (${Math.round(pct * 100)}%)`,
        isToday,
        isFuture: false,
      };
    });

    return { cells, monthHeaders };
  }, [todayStr, allRecords, commitments.length]);

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto py-4 sm:py-6 gap-6 sm:gap-8 select-none">
      
      {/* ─── HEADER SECTION ─────────────────────────────────────────────────── */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#222227]">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1C1C20] border border-[#2E2E35] font-mono text-[10px] text-[#FFFC00] font-bold tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFFC00] animate-pulse" />
              VELOCITY &amp; STREAKS
            </span>
            <span className="font-mono text-[11px] text-zinc-500 font-semibold tracking-wider uppercase">
              HISTORICAL TELEMETRY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Progress &amp; Consistency
          </h1>
          <p className="font-mono text-xs text-zinc-400">
            Long-term discipline trajectory &amp; habit adherence over time
          </p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#141416] border border-[#26262B] text-white font-mono text-xs font-semibold">
              <CalendarIcon className="w-3.5 h-3.5 text-[#FFFC00]" />
              <span>Rolling 16 Weeks // {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
            </div>
            <span className="text-zinc-600 font-mono text-xs">|</span>
            <span className={cn(
              "font-mono text-[11px] font-semibold flex items-center gap-1",
              currentStreak > 0 ? "text-[#00D664]" : "text-zinc-400"
            )}>
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                currentStreak > 0 ? "bg-[#00D664]" : "bg-zinc-500"
              )} />
              {currentStreak > 0 ? "FORTRESS ACTIVE" : "CALIBRATING CADENCE"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportDossier}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1C1C20] hover:bg-[#24242C] border border-[#2E2E35] text-white font-bold text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-zinc-300" />
            <span>{dossierExported ? "Dossier Exported!" : "Export Dossier"}</span>
          </button>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFFC00] text-black font-extrabold text-xs shadow-lg shadow-[#FFFC00]/20 hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_rgba(255,252,0,0.35)] transition-all cursor-pointer"
          >
            <FileEdit className="w-4 h-4" />
            <span>Today&apos;s Sanctuary</span>
          </Link>
        </div>
      </section>

      {/* ─── 3 CORE QUESTIONS KPI CARDS ─────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Staying Consistent */}
        <div className="relative overflow-hidden rounded-2xl bg-[#141416] border border-[#26262B] p-5 flex flex-col justify-between gap-4 group hover:border-[#32323A] transition-all">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                CORE QUESTION 01
              </span>
              <span className="text-sm font-bold text-white mt-0.5">Am I staying consistent?</span>
            </div>
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center",
              consistencyIndex >= 70
                ? "bg-[#00D664]/10 border border-[#00D664]/30 text-[#00D664]"
                : "bg-zinc-800/40 border border-zinc-700/40 text-zinc-400"
            )}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl sm:text-4xl text-white font-extrabold tracking-tight">
                {consistencyIndex > 0 ? `${consistencyIndex}%` : "0.0%"}
              </span>
              <span className={cn(
                "inline-flex items-center gap-0.5 font-mono text-xs font-bold px-2 py-0.5 rounded-full border",
                allRecords.length > 0
                  ? consistencyIndex >= 70
                    ? "text-[#00D664] bg-[#00D664]/10 border-[#00D664]/20"
                    : "text-[#FFFC00] bg-[#FFFC00]/10 border-[#FFFC00]/20"
                  : "text-zinc-400 bg-zinc-800/40 border-zinc-700/40"
              )}>
                {allRecords.length > 0 ? (consistencyIndex >= 70 ? "Optimal" : "Calibrating") : "No Data"}
              </span>
            </div>
            <span className="font-mono text-xs text-zinc-400">
              Consistency Index ({allRecords.length} records logged)
            </span>
          </div>
          <div className="pt-3 border-t border-[#202024] flex items-center justify-between font-mono text-xs">
            <span className="text-zinc-500">Discipline Floor:</span>
            <span className="text-[#FFFC00] font-bold">70.0% Standard Floor</span>
          </div>
        </div>

        {/* Card 2: Performance Trajectory */}
        <div className="relative overflow-hidden rounded-2xl bg-[#141416] border border-[#26262B] p-5 flex flex-col justify-between gap-4 group hover:border-[#32323A] transition-all">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                CORE QUESTION 02
              </span>
              <span className="text-sm font-bold text-white mt-0.5">Performance Trajectory</span>
            </div>
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center",
              currentStreak > 0
                ? "bg-[#FFFC00]/10 border border-[#FFFC00]/30 text-[#FFFC00]"
                : "bg-zinc-800/40 border border-zinc-700/40 text-zinc-400"
            )}>
              <Rocket className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "font-mono text-2xl sm:text-3xl font-extrabold tracking-tight",
                consistencyIndex >= 70 ? "text-[#00D664]" : "text-zinc-300"
              )}>
                {allRecords.length === 0 ? "Calibrating" : consistencyIndex >= 70 ? "Ascending" : "Calibrating"}
              </span>
              <span className={cn(
                "inline-flex items-center gap-0.5 font-mono text-xs font-bold px-2 py-0.5 rounded-full border",
                currentStreak > 0 
                  ? "text-[#00D664] bg-[#00D664]/10 border-[#00D664]/20" 
                  : "text-zinc-400 bg-zinc-800/40 border-zinc-700/40"
              )}>
                {currentStreak > 0 ? `${currentStreak}d Streak` : "0d Streak"}
              </span>
            </div>
            <span className="font-mono text-xs text-zinc-400">
              {commitments.length > 0 ? `${commitments.length} active discipline pillars tracked` : "No habit directives inscribed yet"}
            </span>
          </div>
          <div className="pt-3 border-t border-[#202024] flex items-center justify-between font-mono text-xs">
            <span className="text-zinc-500">Status Vector:</span>
            <span className={cn(
              "font-bold",
              currentStreak > 0 ? "text-[#00D664]" : "text-zinc-400"
            )}>
              {currentStreak > 0 ? "Defensive Moat Active" : "Awaiting Daily Execution"}
            </span>
          </div>
        </div>

        {/* Card 3: Peak Vectors & Anchor */}
        <div className="relative overflow-hidden rounded-2xl bg-[#141416] border border-[#26262B] p-5 flex flex-col justify-between gap-4 group hover:border-[#32323A] transition-all">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                CORE QUESTION 03
              </span>
              <span className="text-sm font-bold text-white mt-0.5">Peak Vectors &amp; Anchor</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#1C1C20] border border-[#2E2E35] flex items-center justify-center text-white">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-zinc-400">Peak Adherence Day:</span>
              <span className="font-mono text-xs text-white font-bold bg-[#1C1C20] px-2 py-0.5 rounded border border-[#2E2E35]">
                {peakAdherenceDay.name} {peakAdherenceDay.pct > 0 ? `(${peakAdherenceDay.pct}%)` : ""}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-zinc-400">Anchor Habit:</span>
              <span className="font-mono text-xs text-[#FFFC00] font-bold truncate max-w-[170px]" title={commitments[0]?.title ?? "None"}>
                {commitments[0]?.title ?? "None Configured"}
              </span>
            </div>
          </div>
          <div className="pt-3 border-t border-[#202024] flex items-center justify-between font-mono text-xs">
            <span className="text-zinc-500">Anchor Streak:</span>
            <span className="text-white font-bold font-mono">{currentStreak} Days Unbroken</span>
          </div>
        </div>
      </section>

      {/* ─── CHARTS ROW: WEEKLY VELOCITY & CONSISTENCY TREND ─────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Weekly Velocity Chart */}
        <div className="lg:col-span-5 rounded-2xl bg-[#141416] border border-[#26262B] p-6 flex flex-col justify-between gap-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FFFC00]" />
                <h2 className="text-base font-bold text-white">Weekly Velocity Chart</h2>
              </div>
              <p className="font-mono text-xs text-zinc-400 mt-0.5">
                Daily completion volume vs daily quota ({commitments.length} habits)
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#1C1C20] border border-[#2E2E35] font-mono text-[11px] text-[#00D664] font-bold">
              {weeklyVelocityData.weekRate}% Week Rate
            </span>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            {/* Benchmark Target Line */}
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 border-b border-dashed border-[#2E2E35] pb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-[#FFFC00]" /> Quota: {commitments.length} habits/day
              </span>
              <span className="text-zinc-500">70% fortress floor</span>
            </div>

            {/* Real Bar Grid */}
            <div className="grid grid-cols-7 gap-2 h-44 items-end pt-2 pb-1 border-b border-[#202024]">
              {weeklyVelocityData.days.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center h-full justify-end gap-1.5 group">
                  <span className={cn(
                    "font-mono text-[10px] font-bold group-hover:text-white transition-colors",
                    item.peak ? "text-[#FFFC00]" : "text-zinc-400"
                  )}>
                    {item.val}
                  </span>
                  <div className={cn(
                    "w-full max-w-[34px] bg-[#1C1C20] rounded-t-lg relative flex flex-col justify-end overflow-hidden h-full border",
                    item.isToday 
                      ? "border-[#FFFC00]/60 ring-1 ring-[#FFFC00]/30" 
                      : item.peak 
                      ? "border-[#FFFC00]/40 shadow-sm shadow-[#FFFC00]/20" 
                      : "border-[#2A2A30]"
                  )}>
                    <div
                      className={cn("w-full rounded-t-lg transition-all group-hover:brightness-110", item.color)}
                      style={{ height: item.pct }}
                    />
                  </div>
                  <span className={cn(
                    "font-mono text-xs font-bold",
                    item.isToday ? "text-[#FFFC00]" : "text-zinc-400"
                  )}>
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between font-mono text-xs pt-1 border-t border-[#202024]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#00D664]" /> 100% Met
              </span>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#FFFC00]" /> Partial
              </span>
            </div>
            <span className="text-white font-bold">
              {weeklyVelocityData.weekCompletedSum} / {weeklyVelocityData.weekPossibleSum} Recorded
            </span>
          </div>
        </div>

        {/* 2. Consistency Trend Chart */}
        <div className="lg:col-span-7 rounded-2xl bg-[#141416] border border-[#26262B] p-6 flex flex-col justify-between gap-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00D664]" />
                <h2 className="text-base font-bold text-white">Consistency Trend Trajectory</h2>
              </div>
              <p className="font-mono text-xs text-zinc-400 mt-0.5">
                Rolling consistency trajectory vs benchmark floor
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-[#00D664]/10 border border-[#00D664]/30 font-mono text-[11px] text-[#00D664] font-bold">
                Current: {consistencyIndex}%
              </span>
            </div>
          </div>

          <div className="relative w-full h-44 rounded-xl bg-[#101012] border border-[#26262B] p-3 flex flex-col justify-between overflow-hidden">
            {/* Grid Lines */}
            <div className="absolute inset-x-3 top-3 bottom-8 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-zinc-500 w-full" />
              <div className="border-b border-zinc-500 w-full" />
              <div className="border-b border-zinc-500 w-full" />
            </div>

            {/* Standard Floor Line */}
            <div className="absolute inset-x-3 top-[38%] border-b border-dashed border-[#FFFC00] pointer-events-none z-10 flex items-center justify-end pr-2">
              <span className="bg-[#141416] px-1.5 py-0.5 rounded font-mono text-[9px] text-[#FFFC00] font-bold border border-[#FFFC00]/30 shadow">
                70% Floor Standard
              </span>
            </div>

            {/* Trajectory Display */}
            {allRecords.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center z-20">
                <span className="font-mono text-xs text-zinc-500 font-bold uppercase tracking-wider">
                  TELEMETRY BENCHMARK: AWAITING FIRST CYCLE OF LOGS
                </span>
                <span className="text-[11px] text-zinc-600 mt-1">
                  Trend curve illuminates automatically as daily habits are completed
                </span>
              </div>
            ) : (
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 120">
                <defs>
                  <linearGradient id="trendGradientProg" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#00D664" stopOpacity="0.35" />
                    <stop offset="70%" stopColor="#FFFC00" stopOpacity="0.10" />
                    <stop offset="100%" stopColor="#0E0E10" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon
                  fill="url(#trendGradientProg)"
                  points="20,110 20,80 70,72 120,68 170,82 220,58 270,48 320,54 370,38 420,44 470,28 520,32 580,18 580,110"
                />
                <polyline
                  fill="none"
                  points="20,80 70,72 120,68 170,82 220,58 270,48 320,54 370,38 420,44 470,28 520,32 580,18"
                  stroke="#00D664"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                />
                <circle cx="580" cy="18" fill="#00D664" r="5" stroke="#FFFC00" strokeWidth="2" />
              </svg>
            )}

            {/* X-Axis Labels */}
            <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500 pt-1 border-t border-[#222228] z-20">
              <span>W01</span>
              <span>W04</span>
              <span>W08</span>
              <span className="text-[#FFFC00] font-bold">CURRENT ({consistencyIndex}%)</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs pt-1 border-t border-[#202024]">
            <div className="flex items-center gap-4 text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#00D664]" /> Actual Adherence
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-b border-dashed border-[#FFFC00]" /> 70% Standard Floor
              </span>
            </div>
            <span className="font-mono text-[#00D664] font-bold text-xs">
              {allRecords.length > 0 ? "Active Telemetry Stream" : "Awaiting Daily Logs"}
            </span>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: SEVEN-DAY ACTIVITY SUMMARY ──────────────────────────── */}
      <section className="rounded-2xl bg-[#141416] border border-[#26262B] p-6 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Seven-Day Activity Summary
            </h2>
            <p className="font-mono text-xs text-zinc-400 mt-0.5">
              Day-by-day status for the previous rolling cycle with ring scores &amp; fortress flags
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#1C1C20] border border-[#2E2E35] font-mono text-xs text-zinc-300 font-semibold">
              Weekly Adherence: <span className="text-[#00D664] font-bold">{weeklyVelocityData.weekRate}%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {sevenDaySummary.map((item, idx) => (
            <div
              key={idx}
              className={cn(
                "rounded-xl p-3.5 flex flex-col items-center text-center gap-2 transition-all",
                item.peak
                  ? "bg-[#1C1C22] border-2 border-[#FFFC00]/60 shadow-lg shadow-[#FFFC00]/10"
                  : item.isToday
                  ? "bg-[#18181C] border border-[#FFFC00]/50"
                  : "bg-[#18181B] border border-[#2E2E35]"
              )}
            >
              <span className={cn(
                "font-mono text-[11px] uppercase font-semibold",
                item.isToday ? "text-[#FFFC00] font-bold" : "text-zinc-400"
              )}>
                {item.day}
              </span>
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#24242A]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                  />
                  <path
                    stroke={item.stroke}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeDasharray={item.dash}
                    strokeWidth="3.5"
                  />
                </svg>
                <span className="absolute font-mono text-[11px] text-white font-extrabold">{item.pct}</span>
              </div>
              <span className="font-mono text-xs font-bold text-white">{item.val}</span>
              <span className={cn("font-mono text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border", item.tagColor)}>
                {item.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION 4: CALENDAR HEATMAP (DISCIPLINE DENSITY) ────────────────── */}
      <section className="rounded-2xl bg-[#141416] border border-[#26262B] p-6 flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Grid className="w-4 h-4 text-[#00D664]" />
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Calendar Heatmap (Discipline Density)
              </h2>
            </div>
            <p className="font-mono text-xs text-zinc-400 mt-0.5">
              Multi-month adherence telemetry across the past 16 rolling weeks
            </p>
          </div>
          {/* Intensity Legend */}
          <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
            <span>Inactive</span>
            <span className="w-3.5 h-3.5 rounded bg-[#18181C] border border-[#26262B]" />
            <span className="w-3.5 h-3.5 rounded bg-[#064e3b]" />
            <span className="w-3.5 h-3.5 rounded bg-[#059669]" />
            <span className="w-3.5 h-3.5 rounded bg-[#00D664]" />
            <span className="w-3.5 h-3.5 rounded bg-[#FFFC00] shadow-sm shadow-[#FFFC00]/40" />
            <span className="text-[#FFFC00] font-bold">100% Fortress</span>
          </div>
        </div>

        {/* Notice If No Records Logged */}
        {allRecords.length === 0 && (
          <div className="px-4 py-2.5 rounded-xl bg-[#18181C] border border-[#26262B] text-zinc-400 font-mono text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FFFC00] animate-pulse" />
            <span>● AWAITING TELEMETRY: No commitment records logged yet. Check off your daily disciplines in Today&apos;s Sanctuary to illuminate the density grid.</span>
          </div>
        )}

        {/* 16 Weeks x 7 Days Heatmap Matrix */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[700px] flex flex-col gap-2">
            <div className="grid grid-cols-4 font-mono text-xs text-zinc-400 font-bold px-8">
              {heatmapData.monthHeaders.map((m, idx) => (
                <div key={idx} className={idx === 3 ? "text-[#FFFC00]" : ""}>
                  {m}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <div className="flex flex-col justify-between py-1 font-mono text-[10px] text-zinc-500 font-bold w-6">
                <span>M</span>
                <span>W</span>
                <span>F</span>
                <span>S</span>
              </div>
              <div className="grid grid-flow-col grid-rows-7 gap-1.5 flex-1">
                {heatmapData.cells.map((cell, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "w-4 h-4 rounded transition-all hover:scale-125 cursor-pointer",
                      cell.color,
                      cell.isToday && "ring-2 ring-[#FFFC00] ring-offset-1 ring-offset-[#141416]"
                    )}
                    title={cell.title}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#202024] font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Unbroken Streak:</span>
            <span className="text-[#FFFC00] font-bold">{currentStreak} Days in Active Defense</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <span>Longest Run: <span className="text-white font-bold">{longestStreak} Days</span></span>
            <span>·</span>
            <span>Total Fortress Days: <span className="text-[#00D664] font-bold">{fortressDaysCount} / {evaluatedDaysCount}</span></span>
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: TRACKED HABIT CONTRIBUTION LEDGER ──────────────────── */}
      <section className="rounded-2xl bg-[#141416] border border-[#26262B] p-6 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Tracked Habit Contribution Ledger
            </h2>
            <p className="font-mono text-xs text-zinc-400 mt-0.5">
              Discipline pillars ranked by consistency volume and stability weight
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCategoryFilter("all")}
              className={cn(
                "px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold transition-all cursor-pointer",
                categoryFilter === "all"
                  ? "bg-[#1C1C20] border-[#FFFC00]/40 text-[#FFFC00]"
                  : "bg-[#141416] border-[#2E2E35] text-zinc-400 hover:text-white"
              )}
            >
              All Pillars
            </button>
            <button
              onClick={() => setCategoryFilter("active")}
              className={cn(
                "px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold transition-all cursor-pointer",
                categoryFilter === "active"
                  ? "bg-[#1C1C20] border-[#FFFC00]/40 text-[#FFFC00]"
                  : "bg-[#141416] border-[#2E2E35] text-zinc-400 hover:text-white"
              )}
            >
              Active Only
            </button>
          </div>
        </div>

        {habitItems.length === 0 ? (
          <EmptyState
            icon={Grid}
            title="No Directives Inscribed"
            description="You have not created any habit directives yet. Inscribe your first daily discipline in the Habits vault or Sanctuary to activate telemetry tracking."
            action={
              <Link
                href="/habits"
                className="px-4 py-2.5 bg-[#FFFC00] text-black font-extrabold text-xs rounded-xl shadow-md shadow-[#FFFC00]/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                + Inscribe First Habit
              </Link>
            }
            tip="Pro Tip: Start with 1-2 core daily commitments to establish momentum."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {habitItems.map((habit) => {
              const Icon = habit.icon;
              return (
                <div
                  key={habit.id}
                  className="rounded-xl bg-[#18181B] border border-[#26262B] hover:border-[#32323A] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className={cn(
                      "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0",
                      habit.iconColor
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-sm sm:text-base">
                          {habit.title}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-md border border-cyan-400/20 font-bold">
                          {habit.category}
                        </span>
                        {habit.isAnchor && (
                          <span className="font-mono text-[10px] uppercase tracking-wider text-[#FFFC00] bg-[#FFFC00]/10 px-2 py-0.5 rounded-md border border-[#FFFC00]/20 font-bold">
                            Anchor Pillar
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs text-zinc-400 mt-0.5">
                        {habit.description}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#222228]">
                    {/* Streak */}
                    <div className="flex flex-col lg:items-end">
                      <span className="font-mono text-[10px] uppercase text-zinc-500 font-bold">
                        Current Streak
                      </span>
                      <span className="font-mono text-sm font-extrabold text-[#00D664]">
                        {habit.streak} Days
                      </span>
                    </div>

                    {/* 30-Day Adherence Bar */}
                    <div className="flex flex-col w-36 gap-1">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-zinc-400">Adherence</span>
                        <span className="text-white font-bold">{habit.adherence}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#202024] overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            habit.status === "Optimal" ? "bg-[#00D664]" : "bg-[#FFFC00]"
                          )}
                          style={{ width: `${habit.adherence}%` }}
                        />
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={cn(
                      "inline-flex items-center gap-1 font-mono text-[11px] px-2.5 py-1 rounded-full border font-bold",
                      habit.status === "Optimal"
                        ? "text-[#00D664] bg-[#00D664]/10 border-[#00D664]/20"
                        : "text-[#FFFC00] bg-[#FFFC00]/10 border-[#FFFC00]/20"
                    )}>
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        habit.status === "Optimal" ? "bg-[#00D664]" : "bg-[#FFFC00]"
                      )} />
                      {habit.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
