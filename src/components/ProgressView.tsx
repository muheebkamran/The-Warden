"use client";

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { evaluateDay } from '@/lib/evaluation';
import {
  getDayName,
  getDayNumber,
  formatDisplayDate,
  addDays,
  subtractDays,
  getLastNDays,
  getMonthDates
} from '@/lib/dateEngine';
import { ChevronLeft, ChevronRight, Activity } from 'lucide-react';

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

  // --- 1. Long-term stats ---
  const totalKept = allRecords.filter(r => r.status === 'complete').length;
  const consistencyRate = allRecords.length > 0 
    ? Math.round((allRecords.filter(r => r.status === 'complete' || r.status === 'showed_up').length / allRecords.length) * 100)
    : 0;

  // --- 2. Daily Breakdown (Today) ---
  const todayRecords = allRecords.filter(r => r.date === todayStr);

  // --- 3. Weekly Review ---
  const last7Days = getLastNDays(7);
  const weeklyData = last7Days.map(dateStr => {
    const dayRecords = allRecords.filter(r => r.date === dateStr);
    const positiveCount = dayRecords.filter(r => r.status === 'complete' || r.status === 'showed_up').length;
    const isPass = dayRecords.length > 0 ? evaluateDay(dayRecords.length, positiveCount) : false;
    // Assuming grace day applies to today if graceDayActive, or handled by historical records
    // Since we don't have historical grace day in records explicitly, we'll mark miss or pass
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
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. LONG-TERM STATS */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="flex flex-col items-center justify-center p-6">
          <div className={`font-serif text-4xl mb-1 ${streakState && streakState.currentStreak > 0 ? 'text-[var(--accent-gold)]' : 'text-[var(--text-ivory)]'}`}>
            {streakState?.currentStreak || 0}
          </div>
          <div className="text-[var(--text-stone)] text-xs tracking-wider uppercase">Current Streak</div>
        </Card>
        
        <Card className="flex flex-col items-center justify-center p-6">
          <div className="font-serif text-4xl mb-1 text-[var(--text-stone)]">
            {streakState?.longestStreak || 0}
          </div>
          <div className="text-[var(--text-stone)] text-xs tracking-wider uppercase">Longest Streak</div>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6">
          <div className="font-serif text-4xl mb-1 text-[var(--text-ivory)]">
            {totalKept}
          </div>
          <div className="text-[var(--text-stone)] text-xs tracking-wider uppercase">Total Kept</div>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6">
          <div className="font-serif text-4xl mb-1 text-[var(--text-ivory)]">
            {consistencyRate}%
          </div>
          <div className="text-[var(--text-stone)] text-xs tracking-wider uppercase">Consistency</div>
        </Card>
      </section>

      {/* 2. DAILY BREAKDOWN */}
      <section>
        <Card className="p-6">
          <h2 className="text-[var(--text-ivory)] font-medium mb-4">Today's Breakdown</h2>
          {commitments.length === 0 ? (
            <EmptyState title="No active commitments" description="Create one to see your breakdown." icon={Activity} />
          ) : (
            <div className="space-y-4">
              {commitments.map(c => {
                const record = todayRecords.find(r => r.commitmentId === c.id);
                const actual = record?.actualValue || 0;
                const percentage = c.targetValue > 0 ? Math.min(100, Math.round((actual / c.targetValue) * 100)) : (actual > 0 ? 100 : 0);
                
                return (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-[var(--radius-sm)] bg-[var(--bg-obsidian)] border border-[var(--border-default)]">
                    <div className="flex-1">
                      <div className="text-[var(--text-ivory)] text-sm font-medium mb-1">{c.title}</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[var(--accent-gold)] transition-all duration-500" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)] w-12 text-right">
                          {actual} / {c.targetValue} {c.unit}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {record ? (
                        <Badge variant={record.status}>{record.status.replace('_', ' ')}</Badge>
                      ) : (
                        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Pending</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 3. WEEKLY REVIEW */}
        <section>
          <Card className="p-6 h-full flex flex-col">
            <h2 className="text-[var(--text-ivory)] font-medium mb-6">Last 7 Days</h2>
            <div className="flex justify-between items-end flex-1">
              {weeklyData.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase">{day.dayName}</span>
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full border border-[var(--border-default)]
                    ${day.isToday ? 'ring-2 ring-[var(--accent-gold)] ring-offset-2 ring-offset-[var(--bg-surface)]' : ''}
                  `}>
                    <span className="text-[10px] text-[var(--text-stone)] font-medium">{day.dayNumber}</span>
                  </div>
                  <div className="mt-2 w-2 h-2 rounded-full flex items-center justify-center">
                    {day.isGrace ? (
                      <div className="w-2 h-2 rounded-full bg-[var(--status-warning)]" />
                    ) : day.hasData ? (
                      day.isPass ? (
                        <div className="w-2 h-2 rounded-full bg-[var(--status-success)]" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-[var(--status-error)]" />
                      )
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--border-default)]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* 4. MONTHLY HEATMAP */}
        <section>
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[var(--text-ivory)] font-medium">Heatmap</h2>
              <div className="flex items-center gap-4">
                <button onClick={handlePrevMonth} className="text-[var(--text-muted)] hover:text-[var(--text-ivory)] transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-[var(--text-stone)] w-28 text-center">{monthName}</span>
                <button onClick={handleNextMonth} className="text-[var(--text-muted)] hover:text-[var(--text-ivory)] transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map((d, i) => (
                <div key={i} className="text-center text-[10px] text-[var(--text-muted)] font-medium">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {/* Leading empty cells for alignment */}
              {Array.from({ length: new Date(currentYear, currentMonth - 1, 1).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="w-full aspect-square" />
              ))}
              {monthDates.map((dateStr, i) => {
                const isToday = dateStr === todayStr;
                
                const dayRecords = allRecords.filter(r => r.date === dateStr);
                const hasData = dayRecords.length > 0;
                let bgClass = "bg-[var(--bg-obsidian)]";
                
                if (hasData) {
                  const positiveCount = dayRecords.filter(r => r.status === 'complete' || r.status === 'showed_up').length;
                  const isPass = evaluateDay(dayRecords.length, positiveCount);
                  if (isPass) {
                    bgClass = "bg-[var(--accent-gold-muted)]";
                  } else {
                    bgClass = "bg-[var(--bg-surface)]";
                  }
                }

                return (
                  <div 
                    key={dateStr}
                    className={`
                      w-full aspect-square rounded-[var(--radius-sm)] flex items-center justify-center
                      ${bgClass}
                      ${isToday ? 'border border-[var(--accent-gold)]' : 'border border-[var(--border-default)]'}
                    `}
                    title={formatDisplayDate(dateStr)}
                  >
                    <span className="text-[10px] text-[var(--text-muted)] opacity-50">{getDayNumber(dateStr)}</span>
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
