"use client";

import { useState } from "react";
import CommitmentCard from "@/components/CommitmentCard";
import CommitmentModal from "@/components/CommitmentModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getDateEditability } from "@/lib/dateEngine";

type TodayDashboardProps = {
  commitments: any[];
  records: any[];
  streakState: any | null;
  todayStr: string;
  yesterdayStr: string;
};

export default function TodayDashboard({ commitments, records, streakState, todayStr, yesterdayStr }: TodayDashboardProps) {
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const activeCommitments = commitments.filter(c => c.isActive);
  const total = activeCommitments.length;
  const required = Math.ceil(0.70 * total);

  const selectedRecords = records.filter(r => r.date === selectedDate);
  const positive = selectedRecords.filter(r => r.status === 'complete' || r.status === 'showed_up').length;

  const editable = getDateEditability(selectedDate) === 'editable';
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 pb-20 animate-fade-in">
      <header className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 bg-[var(--bg-elevated)] p-1 rounded-full">
            <button 
              onClick={() => setSelectedDate(todayStr)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedDate === todayStr 
                  ? "bg-[var(--accent-gold)] text-[var(--bg-obsidian)]" 
                  : "text-[var(--text-stone)] hover:text-[var(--text-ivory)]"
              }`}
            >
              Today
            </button>
            <button 
              onClick={() => setSelectedDate(yesterdayStr)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedDate === yesterdayStr 
                  ? "bg-[var(--accent-gold)] text-[var(--bg-obsidian)]" 
                  : "text-[var(--text-stone)] hover:text-[var(--text-ivory)]"
              }`}
            >
              Yesterday
            </button>
          </div>
          <div className="text-[var(--text-stone)] text-sm">
            {formatDate(selectedDate)}
          </div>
        </div>

        <div>
          {(!streakState || streakState.currentStreak === 0) ? (
            <>
              <div className="text-[var(--text-stone)] text-xs tracking-[0.2em] font-sans uppercase mb-2">GOOD MORNING.</div>
              <h1 className="font-serif italic text-2xl md:text-3xl text-[var(--text-ivory)]">
                You have {total} commitments today.
              </h1>
            </>
          ) : (
            <div className="flex items-baseline gap-4">
              <h1 className="font-serif text-5xl md:text-6xl text-[var(--text-ivory)] uppercase">
                DAY {streakState.currentStreak}
              </h1>
              <div className="w-2 h-2 rounded-full bg-[var(--accent-gold)]" />
            </div>
          )}
        </div>

        {streakState?.graceDayActive && selectedDate === todayStr && (
          <div>
            <Badge variant="grace" className="bg-[var(--status-warning)] text-[var(--bg-obsidian)] px-3 py-1 rounded">
              1 GRACE DAY REMAINING
            </Badge>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="text-[var(--text-stone)] text-xs">
            {positive} of {required} commitments required to maintain your streak
          </div>
          <div className="w-full h-1 bg-[var(--bg-surface)] rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${positive >= required ? 'bg-[var(--status-success)]' : 'bg-[var(--accent-gold)]'}`}
              style={{ width: `${Math.min(100, (positive / (required || 1)) * 100)}%` }}
            />
          </div>
        </div>
      </header>

      {positive >= required && total > 0 && (
        <div className="text-[var(--accent-gold)] font-serif italic text-lg animate-fade-in text-center">
          Day Complete. You kept your word.
        </div>
      )}

      <main className="flex flex-col gap-4">
        {activeCommitments.length === 0 ? (
          <EmptyState 
            title="No commitments yet" 
            description="Add your first daily commitment to begin."
            action={<Button variant="primary" onClick={() => setIsAddModalOpen(true)}>Add Commitment</Button>}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {activeCommitments.map(commitment => {
              const record = selectedRecords.find(r => r.commitmentId === commitment.id);
              return (
                <CommitmentCard 
                  key={commitment.id}
                  commitment={commitment}
                  record={record}
                  dateStr={selectedDate}
                  editable={editable}
                />
              );
            })}
            <div className="mt-4 text-center">
              <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
                + Add Commitment
              </Button>
            </div>
          </div>
        )}
      </main>

      <CommitmentModal 
        open={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        activeCount={total}
      />
    </div>
  );
}
