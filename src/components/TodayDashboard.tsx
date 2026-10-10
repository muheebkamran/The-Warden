"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import CommitmentCard from "@/components/CommitmentCard";
import CommitmentModal from "@/components/CommitmentModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getDateEditability } from "@/lib/dateEngine";
import { saveReflection, getReflection } from "@/app/actions";
import { cn } from "@/lib/utils";
import {
  Target,
  Flame,
  Plus,
  Calendar,
  Check,
  CheckCircle2,
  FileText,
  Lock,
  BookOpen,
  Hourglass,
  Quote,
  ArrowRight,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

type TodayDashboardProps = {
  commitments: {
    id: string;
    title: string;
    targetValue: number;
    unit: string;
    type: string;
    isActive: boolean;
  }[];
  records: {
    id: string;
    commitmentId: string;
    date: string;
    status: string;
    actualValue: number;
    note: string | null;
    photoUrl?: string | null;
  }[];
  streakState: {
    currentStreak: number;
    longestStreak: number;
    graceDayActive?: boolean;
  } | null;
  todayStr: string;
  yesterdayStr: string;
};

export default function TodayDashboard({
  commitments,
  records,
  streakState,
  todayStr,
  yesterdayStr,
}: TodayDashboardProps) {
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [reflectionText, setReflectionText] = useState("");
  const [isSavingReflection, setIsSavingReflection] = useState(false);
  const [reflectionLoaded, setReflectionLoaded] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");

  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);

  const activeCommitments = commitments.filter((c) => c.isActive);
  const total = activeCommitments.length;
  const required = Math.ceil(0.70 * total);

  const selectedRecords = records.filter((r) => r.date === selectedDate);
  const positive = selectedRecords.filter(
    (r) => r.status === "complete" || r.status === "showed_up"
  ).length;

  const status = getDateEditability(selectedDate);
  const editable = status === "editable" || status === "limited";

  const formatDateLong = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const formatShortDay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    async function loadReflection() {
      setReflectionLoaded(false);
      try {
        const ref = await getReflection(selectedDate);
        setReflectionText(ref?.text || "");
      } catch {
        setReflectionText("");
      } finally {
        setReflectionLoaded(true);
      }
    }
    loadReflection();
  }, [selectedDate]);

  const handleSaveReflection = async () => {
    setIsSavingReflection(true);
    try {
      await saveReflection(selectedDate, reflectionText);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingReflection(false);
    }
  };

  // Staggered Entrance Animation
  useGSAP(
    () => {
      if (!cardsRef.current) return;
      const cards = gsap.utils.toArray(cardsRef.current.children);
      if (cards.length === 0) return;

      gsap.fromTo(
        cards,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: "power2.out" }
      );
    },
    { dependencies: [selectedDate, activeCommitments.length, filterType], scope: containerRef }
  );

  // Compute 7-day mini strip ending on today
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(todayStr);
    d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().split("T")[0];
    const dayRecords = records.filter((r) => r.date === iso);
    const dayPositive = dayRecords.filter(
      (r) => r.status === "complete" || r.status === "showed_up"
    ).length;
    const isPassed = total > 0 ? dayPositive >= Math.ceil(0.7 * total) : dayPositive > 0;
    const isToday = iso === todayStr;
    const dayLabel = ["S", "M", "T", "W", "T", "F", "S"][d.getDay()];
    return { iso, dayLabel, isPassed, isToday };
  });

  // Filter commitments based on category filter
  const filteredCommitments = activeCommitments.filter((c) => {
    if (filterType === "all") return true;
    return c.type.toLowerCase() === filterType.toLowerCase();
  });

  const completionPct = total > 0 ? Math.round((positive / total) * 100) : 0;
  const targetThresholdPct =
    required > 0 ? Math.min(100, Math.round((positive / required) * 100)) : 0;

  return (
    <div
      ref={containerRef}
      className="w-full max-w-6xl mx-auto flex flex-col gap-8 pb-20 animate-fade-in"
    >
      {/* ─── TOP ACTION BAR & DATE ARCHITECTURE (STITCH HEADER) ──────────── */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-[#222227]">
        <div className="flex flex-col gap-2">
          {/* Metadata Sector Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFFC00]/15 border border-[#FFFC00]/30 text-[#FFFC00] font-mono text-[10px] font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFFC00] animate-pulse" />
              ● SECTOR ALPHA
            </span>
            <span className="font-mono text-xs text-zinc-400 font-semibold tracking-wider">
              DIURNAL PROTOCOL
            </span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Daily Sanctuary
          </h1>
          <p className="text-xs sm:text-sm font-medium text-zinc-400">
            {selectedDate === todayStr ? `Today is ${formatDateLong(todayStr)}` : `Reviewing ${formatDateLong(selectedDate)}`} · Focus on essential execution.
          </p>
        </div>

        {/* Date Segment Filter & Quick Entry Trigger */}
        <div className="flex flex-wrap items-center gap-3">
          <nav
            aria-label="Date Navigation"
            className="flex items-center bg-[#18181C] border border-[#2C2C33] p-1 rounded-2xl shadow-inner"
          >
            <button
              onClick={() => setSelectedDate(yesterdayStr)}
              className={cn(
                "px-3.5 py-1.5 font-bold text-xs rounded-xl transition-all cursor-pointer",
                selectedDate === yesterdayStr
                  ? "bg-[#27272C] text-white border border-white/10 shadow-sm"
                  : "text-zinc-400 hover:text-white"
              )}
              type="button"
            >
              Yesterday
            </button>
            <button
              onClick={() => setSelectedDate(todayStr)}
              className={cn(
                "px-4 py-1.5 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer",
                selectedDate === todayStr
                  ? "bg-[#FFFC00] text-black shadow-md shadow-[#FFFC00]/25 font-black"
                  : "text-zinc-400 hover:text-white"
              )}
              type="button"
            >
              <span>Today ({formatShortDay(todayStr)})</span>
            </button>
            <button
              disabled
              className="px-3.5 py-1.5 font-bold text-xs text-zinc-600 cursor-not-allowed rounded-xl flex items-center gap-1"
              type="button"
              title="Future date locked"
            >
              <Lock className="w-3 h-3 text-zinc-600" />
              <span>Tomorrow</span>
            </button>
          </nav>

          {/* Quick Entry Action Button */}
          <button
            onClick={() => {
              if (noteRef.current) {
                noteRef.current.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#18181C] hover:bg-[#202025] text-zinc-200 hover:text-white border border-[#2C2C33] hover:border-[#FFFC00]/50 font-bold text-xs rounded-2xl active:scale-95 transition-all cursor-pointer shadow-sm"
            type="button"
          >
            <FileText className="w-3.5 h-3.5 text-[#FFFC00]" />
            <span>Daily Note</span>
          </button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-2xl"
          >
            <Plus className="w-4 h-4 mr-1 inline" />
            <span>+ Add Habit</span>
          </Button>
        </div>
      </header>

      {/* Grace Day Banner If Active */}
      {streakState?.graceDayActive && selectedDate === todayStr && (
        <div className="animate-fade-in">
          <Badge variant="grace" className="px-4 py-2 text-xs w-full justify-center">
            🛡️ 1 FREE GRACE DAY USED — Missed yesterday? Your active streak is protected today! Complete 70% of your habits today to maintain cadence.
          </Badge>
        </div>
      )}

      {/* ─── TOP TELEMETRY METRICS TRIAD (3 STITCH CARDS) ────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Daily Target Threshold */}
        <article className="bg-[#18181C] border border-[#28282E] rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group hover:border-[#383842] transition-colors shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                DAILY THRESHOLD
              </span>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                {completionPct}% Fulfilled
              </span>
            </div>
            {/* Progress Circular Badge */}
            <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                <circle
                  className="text-[#26262D]"
                  cx="24"
                  cy="24"
                  fill="none"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <circle
                  className={positive >= required ? "text-[#00D664]" : "text-[#FFFC00]"}
                  cx="24"
                  cy="24"
                  fill="none"
                  r="20"
                  stroke="currentColor"
                  strokeDasharray="125.66"
                  strokeDashoffset={125.66 - (125.66 * (positive / (total || 1)))}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <span className="absolute font-mono text-xs font-black text-[#FFFC00]">
                {positive}/{total}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-6">
            <div className="w-full bg-[#101013] h-2 rounded-full overflow-hidden border border-[#2E2E35]">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  positive >= required
                    ? "bg-[#00D664] shadow-[0_0_8px_#00D664]"
                    : "bg-[#FFFC00] shadow-[0_0_8px_#FFFC00]"
                )}
                style={{ width: `${targetThresholdPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-zinc-400 font-mono text-[11px] font-medium">
              <span className={positive >= required ? "text-[#00D664] font-bold" : "text-zinc-300 font-semibold"}>
                {positive >= required ? "✓ Discipline floor satisfied" : `${required} habits required to keep streak`}
              </span>
              <span className="text-zinc-500 font-bold">70% Minimum</span>
            </div>
          </div>
        </article>

        {/* Card 2: Fortress Continuity (Streak Indicator) */}
        <article className="bg-[#18181C] border border-[#28282E] rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group hover:border-[#383842] transition-colors shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#FFFC00] font-bold">
                FORTRESS CONTINUITY
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  {streakState ? streakState.currentStreak : 0}
                </span>
                <span className="font-mono text-xs text-[#FFFC00] uppercase tracking-wider font-extrabold flex items-center gap-1">
                  Days Active 🔥
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FFFC00]/15 border border-[#FFFC00]/30 flex items-center justify-center text-[#FFFC00] shadow-lg shadow-[#FFFC00]/10">
              <Flame className="w-6 h-6 fill-[#FFFC00]" />
            </div>
          </div>

          {/* 7-Day Matrix Strip */}
          <div className="flex flex-col gap-1.5 mt-4">
            <div className="grid grid-cols-7 gap-1.5 py-1">
              {last7Days.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span
                    className={cn(
                      "font-mono text-[10px] font-bold",
                      day.isToday ? "text-[#FFFC00]" : "text-zinc-400"
                    )}
                  >
                    {day.dayLabel}
                  </span>
                  <span
                    className={cn(
                      "w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold shadow-sm transition-all",
                      day.isPassed
                        ? "bg-[#00D664] text-black"
                        : day.isToday
                        ? "bg-[#18181C] border border-[#FFFC00] text-[#FFFC00]"
                        : "bg-[#121215] border border-[#2E2E36] text-zinc-500"
                    )}
                  >
                    {day.isPassed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : "·"}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center text-zinc-400 font-mono text-[10px] mt-0.5">
              <span>All-Time High: <strong className="text-white">{streakState?.longestStreak ?? 0} Days</strong></span>
              <span className="text-[#00D664] font-bold">Unbroken Cadence</span>
            </div>
          </div>
        </article>

        {/* Card 3: Sovereign Pact */}
        <article className="bg-[#18181C] border border-[#28282E] rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group hover:border-[#383842] transition-colors shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#FFFC00]" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                SOVEREIGN PACT
              </span>
            </div>
            <span className="font-mono text-[10px] px-2.5 py-0.5 bg-[#FFFC00]/15 border border-[#FFFC00]/30 text-[#FFFC00] rounded-full font-bold">
              {activeCommitments.length > 0 ? "PRIMARY VECTOR" : "PENDING"}
            </span>
          </div>

          <blockquote className="my-3 font-bold text-sm sm:text-base text-zinc-100 leading-snug">
            {activeCommitments.length > 0
              ? `“${activeCommitments[0].title} — Target: ${activeCommitments[0].targetValue} ${activeCommitments[0].unit} daily without compromise.”`
              : "“No diurnal pact established yet. Inscribe your primary commitment to seal your daily discipline.”"}
          </blockquote>

          <div className="flex items-center justify-between pt-1">
            <Link
              href={activeCommitments.length > 0 ? "/habits" : "/habits"}
              className="px-4 py-1.5 bg-[#FFFC00] hover:bg-[#fff933] text-black font-extrabold text-xs rounded-xl transition-all shadow-md shadow-[#FFFC00]/20 flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{activeCommitments.length > 0 ? "Review Directives" : "+ Inscribe Pact"}</span>
            </Link>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-zinc-400 hover:text-white text-xs font-semibold underline underline-offset-4 decoration-zinc-600 transition-colors cursor-pointer"
              type="button"
            >
              + Add Habit
            </button>
          </div>
        </article>
      </section>

      {/* ─── MAIN CONTENT ASYMMETRIC GRID (Matching Screenshot 1 & Stitch) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Habit Execution Matrix (~66% / 8 Cols) */}
        <section className="lg:col-span-8 flex flex-col gap-5">
          {/* Header & Routine Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Daily Disciplines
              </h2>
              <span className="font-mono text-xs text-black font-extrabold bg-[#FFFC00] px-2.5 py-0.5 rounded-full shadow-sm">
                {positive}/{total} Complete
              </span>
            </div>

            {/* Routine Filter Pills (All, Morning, Deep Work, Evening) */}
            <div className="flex items-center gap-1 bg-[#18181C] border border-[#28282E] p-1 rounded-2xl overflow-x-auto">
              {[
                { label: "All", id: "all" },
                { label: "Morning", id: "duration" },
                { label: "Deep Work", id: "quantity" },
                { label: "Evening", id: "boolean" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  className={cn(
                    "px-3.5 py-1 text-xs rounded-xl font-bold transition-all cursor-pointer",
                    filterType === tab.id
                      ? "bg-white text-black font-extrabold shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  )}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Habits Feed */}
          {activeCommitments.length === 0 ? (
            <EmptyState
              icon={Target}
              title="Sanctuary Empty: No Active Disciplines"
              description="True consistency is forged daily. Initialize your first commitment protocol to activate streak tracking and accountability armor."
              action={
                <Button
                  variant="primary"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  + Initialize First Habit
                </Button>
              }
              tip="Pro Tip: Start with 1-2 non-negotiable daily protocols to build unbreakable momentum."
            />
          ) : (
            <div className="flex flex-col gap-3.5" ref={cardsRef}>
              {filteredCommitments.map((commitment) => {
                const record = selectedRecords.find(
                  (r) => r.commitmentId === commitment.id
                );
                return (
                  <div key={commitment.id}>
                    <CommitmentCard
                      commitment={commitment}
                      record={record}
                      dateStr={selectedDate}
                      editable={editable}
                    />
                  </div>
                );
              })}

              {/* Inscribe New Routine Button Strip */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#141417] border border-dashed border-[#34343C] hover:border-[#FFFC00] hover:text-[#FFFC00] text-zinc-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer group"
                type="button"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                <span>Inscribe New Routine into Rulebook</span>
              </button>
            </div>
          )}
        </section>

        {/* Right Column: Daily Reflection & Financial Discipline (~34% / 4 Cols) */}
        <aside className="lg:col-span-4 flex flex-col gap-6" ref={noteRef}>
          {/* Component 1: Daily Reflection Module */}
          <div className="bg-[#18181C] border border-[#28282E] rounded-3xl p-6 flex flex-col gap-4 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#FFFC00]" />
                <h2 className="font-extrabold text-base text-white">Daily Reflection</h2>
              </div>
              <span className="font-mono text-[10px] text-zinc-500 font-semibold">
                Auto-saved 14m ago
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <div className="relative bg-[#101013] border border-[#2E2E36] rounded-2xl p-4 focus-within:border-[#FFFC00] transition-colors">
                {reflectionLoaded ? (
                  <textarea
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    disabled={!editable || isSavingReflection}
                    placeholder="Inscribe qualitative observations..."
                    rows={5}
                    className="w-full bg-transparent text-white font-medium text-xs placeholder:text-zinc-600 focus:outline-none resize-none leading-relaxed"
                  />
                ) : (
                  <div className="h-28 w-full bg-[#1A1A1E] animate-pulse rounded-xl" />
                )}
              </div>

              {/* Tag Pill Strip */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-[#FFFC00]/10 border border-[#FFFC00]/30 text-[#FFFC00] font-bold">
                  #Discipline
                </span>
                <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-[#00D664]/10 border border-[#00D664]/30 text-[#00D664] font-bold">
                  #Focus
                </span>
                <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-[#00D664]/10 border border-[#00D664]/30 text-[#00D664] font-bold">
                  #ImpulseFree
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => {}}
                className="text-zinc-400 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                type="button"
              >
                <span>Formatting</span>
              </button>
              <button
                onClick={handleSaveReflection}
                disabled={!editable || isSavingReflection}
                className="px-4 py-2 bg-[#FFFC00] hover:bg-[#fff933] text-black font-extrabold text-xs rounded-xl shadow-md shadow-[#FFFC00]/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                type="button"
              >
                {isSavingReflection ? "Saving..." : "Save Entry"}
              </button>
            </div>
          </div>

          {/* Component 2: Spending Guard & Impulse Vault Snapshot */}
          <div className="bg-[#18181C] border border-[#28282E] rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#FF2D55]" />
                <h2 className="font-extrabold text-base text-white">Spending Guard</h2>
              </div>
              <span className="font-mono text-[10px] px-2.5 py-0.5 bg-[#FF2D55]/15 border border-[#FF2D55]/30 text-[#FF2D55] rounded-full font-extrabold">
                Active Defense
              </span>
            </div>

            <div className="flex flex-col gap-1 my-1">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                  OUTFLOW TODAY
                </span>
                <span className="font-mono text-3xl text-white font-black">$0.00</span>
              </div>
              <div className="flex items-center justify-between font-mono text-xs text-zinc-400 font-medium">
                <span>Daily Discretionary Limit</span>
                <span className="text-[#FFFC00] font-bold">$65.00</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="w-full bg-[#101013] h-2 rounded-full overflow-hidden border border-[#2E2E36]">
                <div
                  className="bg-gradient-to-r from-[#00D664] to-[#FFFC00] h-full rounded-full"
                  style={{ width: "100%" }}
                />
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-[#00D664] font-bold">100% of capital preserved</span>
                <span className="text-zinc-500 font-medium">0 alerts</span>
              </div>
            </div>

            <Link
              href="/finance"
              className="mt-1 pt-2 flex items-center justify-between text-zinc-400 hover:text-white font-bold text-xs transition-colors group"
            >
              <span>View Impulse Vault &amp; Burn Ledger</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 text-[#FFFC00] transition-transform" />
            </Link>
          </div>

          {/* Component 3: Sovereign Philosophy Micro-Card */}
          <div className="bg-[#141417] border border-[#24242A] rounded-3xl p-5 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Quote className="w-3.5 h-3.5 text-[#FFFC00]" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                Marcus Aurelius · Meditations
              </span>
            </div>
            <p className="text-xs text-zinc-400 italic leading-relaxed font-medium">
              “At dawn, when you have trouble getting out of bed, tell yourself: ‘I have to go to work — as a human being.’”
            </p>
          </div>
        </aside>
      </div>

      {/* Habit Creation Modal */}
      <CommitmentModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        activeCount={total}
      />
    </div>
  );
}
