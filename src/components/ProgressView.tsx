"use client";

import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { evaluateDay } from '@/lib/evaluation';
import { cn } from '@/lib/utils';
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  getDayName,
  getDayNumber,
  formatDisplayDate,
  getLastNDays,
  getMonthDates
} from '@/lib/dateEngine';
import { ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { WeeklyVelocityChart } from '@/components/charts/WeeklyVelocityChart';
import { ConsistencyTrendChart } from '@/components/charts/ConsistencyTrendChart';
import { getWeeklyVelocityData, get30DayConsistencyData } from '@/lib/chartData';

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
  status: 'missed' | 'showed_up' | 'complete';
  note?: string | null;
}

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  graceDayActive: boolean;
}

interface ProgressViewProps {
  commitments: Commitment[];
  allRecords: DailyRecord[];
  streakState: StreakState | null;
  todayStr: string;
}

export function ProgressView({ commitments, allRecords, streakState, todayStr }: ProgressViewProps) {
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(todayStr));
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    const sections = gsap.utils.toArray(containerRef.current.querySelectorAll('.progress-section'));
    if (sections.length === 0) return;
    
    gsap.fromTo(
      sections,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.1)" }
    );
  }, { scope: containerRef });

  // --- 2. Daily Breakdown (Today) ---
  const todayRecords = allRecords.filter(r => r.date === todayStr);

  // --- 3. Weekly Review ---
  const last7Days = getLastNDays(7);
  const weeklyData = last7Days.map(dateStr => {
    const dayRecords = allRecords.filter(r => r.date === dateStr);
    const positiveCount = dayRecords.filter(r => r.status === 'complete' || r.status === 'showed_up').length;
    const isPass = dayRecords.length > 0 ? evaluateDay(dayRecords.length, positiveCount) : false;
    const hasData = dayRecords.length > 0;
    
    return {
      dateStr,
      dayName: getDayName(dateStr),
      dayNumber: getDayNumber(dateStr),
      isPass,
      hasData,
      isToday: dateStr === todayStr,
      isGrace: dateStr === todayStr && streakState?.graceDayActive
    };
  });

  // --- 4. Monthly Heatmap ---
  const currentYear = currentMonthDate.getFullYear();
  const currentMonth = currentMonthDate.getMonth() + 1;
  const monthDates = getMonthDates(currentYear, currentMonth);
  
  const handlePrevMonth = () => {
    const prev = new Date(currentMonthDate);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentMonthDate(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentMonthDate);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonthDate(next);
  };

  const monthName = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="space-y-8 animate-fade-in pt-4 px-4 md:px-0 max-w-4xl mx-auto pb-20" ref={containerRef}>

      <header className="progress-section flex items-center justify-between mb-4">
        <h1 className="font-serif text-3xl text-ivory tracking-tight">Progress</h1>
      </header>

      {/* 2. DAILY BREAKDOWN */}
      <section className="progress-section">
        <Card className="p-6 md:p-8">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-6">Today's Breakdown</h2>
          {commitments.length === 0 ? (
            <EmptyState title="No active commitments" description="Create one to see your breakdown." icon={Activity} />
          ) : (
            <div className="space-y-3">
              {commitments.map(c => {
                const record = todayRecords.find(r => r.commitmentId === c.id);
                const actual = record?.actualValue || 0;
                const percentage = c.targetValue > 0 ? Math.min(100, Math.round((actual / c.targetValue) * 100)) : (actual > 0 ? 100 : 0);
                
                return (
                  <div key={c.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-md bg-obsidian border border-border/50 gap-3">
                    <div className="flex-1 w-full">
                      <div className="text-ivory text-sm font-medium mb-1.5">{c.title}</div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-gold transition-all duration-700 ease-out" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-stone font-mono w-14 text-right">
                          {actual} / {c.targetValue} {c.unit}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-end md:ml-4">
                      {record ? (
                        <Badge variant={record.status}>{record.status.replace('_', ' ')}</Badge>
                      ) : (
                        <span className="text-[10px] text-muted uppercase tracking-wider font-semibold border border-border/50 px-2 py-0.5 rounded-full">Pending</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </section>
      
      {/* 2.5 ANALYTICS & TRENDS CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="progress-section">
          <WeeklyVelocityChart data={getWeeklyVelocityData(allRecords, commitments)} />
        </section>
        <section className="progress-section">
          <ConsistencyTrendChart data={get30DayConsistencyData(allRecords, commitments)} />
        </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 3. WEEKLY REVIEW */}
        <section className="progress-section">
          <Card className="p-6 md:p-8 h-full flex flex-col">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-8">Last 7 Days</h2>
            <div className="flex justify-between items-end flex-1">
              {weeklyData.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <span className="text-[10px] font-semibold text-stone uppercase">{day.dayName}</span>
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300",
                    day.isToday 
                      ? "ring-2 ring-gold ring-offset-2 ring-offset-surface border-gold bg-elevated" 
                      : "border-border bg-obsidian"
                  )}>
                    <span className={cn(
                      "text-[10px] font-medium",
                      day.isToday ? "text-gold" : "text-stone"
                    )}>{day.dayNumber}</span>
                  </div>
                  <div className="mt-1 w-2 h-2 rounded-full flex items-center justify-center">
                    {day.isGrace ? (
                      <div className="w-2 h-2 rounded-full bg-warning shadow-[0_0_8px_rgba(201,154,84,0.5)]" />
                    ) : day.hasData ? (
                      day.isPass ? (
                        <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(127,168,137,0.5)]" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-error" />
                      )
                    ) : (
                      <div className="w-1 h-1 rounded-full bg-border" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* 4. MONTHLY HEATMAP */}
        <section className="progress-section">
          <Card className="p-6 md:p-8 h-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Heatmap</h2>
              <div className="flex items-center gap-4 bg-obsidian rounded-full border border-border/50 p-1 px-2">
                <button onClick={handlePrevMonth} className="text-stone hover:text-ivory transition-colors p-1">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-ivory w-24 text-center tracking-wide uppercase">{monthName}</span>
                <button onClick={handleNextMonth} className="text-stone hover:text-ivory transition-colors p-1">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-3">
              {weekDays.map((d, i) => (
                <div key={i} className="text-center text-[10px] text-stone font-semibold">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5 md:gap-2">
              {/* Leading empty cells for alignment */}
              {Array.from({ length: new Date(currentYear, currentMonth - 1, 1).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="w-full aspect-square" />
              ))}
              {monthDates.map((dateStr, i) => {
                const isToday = dateStr === todayStr;
                
                const dayRecords = allRecords.filter(r => r.date === dateStr);
                const hasData = dayRecords.length > 0;
                let bgClass = "bg-obsidian";
                
                if (hasData) {
                  const positiveCount = dayRecords.filter(r => r.status === 'complete' || r.status === 'showed_up').length;
                  const isPass = evaluateDay(dayRecords.length, positiveCount);
                  if (isPass) {
                    bgClass = "bg-gold/20";
                  } else {
                    bgClass = "bg-surface";
                  }
                }

                return (
                  <div 
                    key={dateStr}
                    className={cn(
                      "w-full aspect-square rounded-sm flex items-center justify-center transition-colors duration-300",
                      bgClass,
                      isToday ? "border-gold border shadow-[inset_0_0_8px_rgba(200,169,107,0.2)]" : "border-border/50 border hover:border-stone"
                    )}
                    title={formatDisplayDate(dateStr)}
                  >
                    <span className="text-[10px] text-stone/70 font-medium">{getDayNumber(dateStr)}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
