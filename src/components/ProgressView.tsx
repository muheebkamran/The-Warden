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
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" }
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
    <div className="space-y-10 animate-fade-in max-w-4xl mx-auto pb-20" ref={containerRef}>

      <header className="progress-section flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#f2f0ea] tracking-tight">Your Progress</h1>
          <p className="font-mono text-xs text-[#9a9a96] uppercase tracking-wider mt-1">See your streaks and consistency over time</p>
        </div>
      </header>

      {/* 2. DAILY BREAKDOWN */}
      <section className="progress-section">
        <Card className="p-6 md:p-8 border-[#3a3244]">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#292c32]">
            <h2 className="font-mono text-xs font-semibold text-[#c8a96b] uppercase tracking-[0.2em]">Today&apos;s Habits</h2>
            <span className="font-mono text-[10px] text-[#9a9a96] uppercase">{commitments.length} HABITS</span>
          </div>

          {commitments.length === 0 ? (
            <EmptyState title="No active habits" description="Add a habit to start tracking your daily progress." icon={Activity} />
          ) : (
            <div className="space-y-3">
              {commitments.map(c => {
                const record = todayRecords.find(r => r.commitmentId === c.id);
                const actual = record?.actualValue || 0;
                const percentage = c.targetValue > 0 ? Math.min(100, Math.round((actual / c.targetValue) * 100)) : (actual > 0 ? 100 : 0);
                
                return (
                  <div key={c.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-md bg-[#0b0c0e] border border-[#292c32] gap-3">
                    <div className="flex-1 w-full">
                      <div className="text-[#f2f0ea] text-sm font-medium mb-1.5">{c.title}</div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-[#1a1d22] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#c8a96b] transition-all duration-500 ease-out rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-[#9a9a96] font-mono w-16 text-right">
                          {actual} / {c.targetValue} {c.unit}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-end md:ml-4">
                      {record ? (
                        <Badge variant={record.status}>{record.status.replace('_', ' ')}</Badge>
                      ) : (
                        <span className="font-mono text-[9px] text-[#62646a] uppercase tracking-wider border border-[#292c32] px-2 py-0.5 rounded-xs">Pending</span>
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
          <Card className="p-6 md:p-8 h-full flex flex-col border-[#3a3244]">
            <h2 className="font-mono text-xs font-semibold text-[#c8a96b] uppercase tracking-[0.2em] mb-8">Last 7 Days</h2>
            <div className="flex justify-between items-end flex-1">
              {weeklyData.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <span className="font-mono text-[10px] font-semibold text-[#9a9a96] uppercase">{day.dayName}</span>
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-sm border transition-all duration-150",
                    day.isToday 
                      ? "border-[#c8a96b] bg-[#1a1d22] text-[#c8a96b]" 
                      : "border-[#292c32] bg-[#0b0c0e] text-[#9a9a96]"
                  )}>
                    <span className="font-mono text-[10px] font-medium">{day.dayNumber}</span>
                  </div>
                  <div className="mt-1 w-2 h-2 rounded-full flex items-center justify-center">
                    {day.isGrace ? (
                      <div className="w-2 h-2 rounded-full bg-[#c99a54] animate-pulse" />
                    ) : day.hasData ? (
                      day.isPass ? (
                        <div className="w-2 h-2 rounded-full bg-[#7fa889]" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-[#b56b6b]" />
                      )
                    ) : (
                      <div className="w-1 h-1 rounded-full bg-[#292c32]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* 4. MONTHLY HEATMAP */}
        <section className="progress-section">
          <Card className="p-6 md:p-8 h-full border-[#3a3244]">
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-[#292c32]">
              <h2 className="font-mono text-xs font-semibold text-[#c8a96b] uppercase tracking-[0.2em]">Monthly Calendar</h2>
              <div className="flex items-center gap-3 bg-[#0b0c0e] rounded-full border border-[#292c32] p-1 px-3">
                <button onClick={handlePrevMonth} className="text-[#9a9a96] hover:text-[#f2f0ea] transition-colors p-0.5 cursor-pointer" aria-label="Previous Month">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] font-semibold text-[#f2f0ea] w-24 text-center tracking-wider uppercase">{monthName}</span>
                <button onClick={handleNextMonth} className="text-[#9a9a96] hover:text-[#f2f0ea] transition-colors p-0.5 cursor-pointer" aria-label="Next Month">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-3">
              {weekDays.map((d, i) => (
                <div key={i} className="text-center font-mono text-[10px] text-[#62646a] font-semibold">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {Array.from({ length: new Date(currentYear, currentMonth - 1, 1).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="w-full aspect-square" />
              ))}
              {monthDates.map((dateStr) => {
                const isToday = dateStr === todayStr;
                
                const dayRecords = allRecords.filter(r => r.date === dateStr);
                const hasData = dayRecords.length > 0;
                let bgClass = "bg-[#0b0c0e]";
                
                if (hasData) {
                  const positiveCount = dayRecords.filter(r => r.status === 'complete' || r.status === 'showed_up').length;
                  const isPass = evaluateDay(dayRecords.length, positiveCount);
                  if (isPass) {
                    bgClass = "bg-[#c8a96b]/20 text-[#f2f0ea]";
                  } else {
                    bgClass = "bg-[#131519] text-[#9a9a96]";
                  }
                }

                return (
                  <div 
                    key={dateStr}
                    className={cn(
                      "w-full aspect-square rounded-xs flex items-center justify-center transition-colors duration-150 font-mono text-[10px]",
                      bgClass,
                      isToday ? "border border-[#c8a96b] text-[#c8a96b]" : "border border-[#292c32] hover:border-[#3a3244]"
                    )}
                    title={formatDisplayDate(dateStr)}
                  >
                    <span>{getDayNumber(dateStr)}</span>
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
