"use client";

import { useState, useEffect } from "react";
import CommitmentCard from "@/components/CommitmentCard";
import CommitmentModal from "@/components/CommitmentModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getDateEditability } from "@/lib/dateEngine";
import { saveReflection, getReflection } from "@/app/actions";

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
  const [reflectionText, setReflectionText] = useState("");
  const [isSavingReflection, setIsSavingReflection] = useState(false);
  const [reflectionLoaded, setReflectionLoaded] = useState(false);

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

  useEffect(() => {
    async function loadReflection() {
      setReflectionLoaded(false);
      try {
        const ref = await getReflection(selectedDate);
        setReflectionText(ref?.text || "");
      } catch (err) {
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

  // Consistency calculations
  const totalKept = records.filter(r => r.status === 'complete' || r.status === 'showed_up').length;
  const consistencyRate = records.length > 0 ? Math.round((totalKept / records.length) * 100) : 0;

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
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline gap-4">
                <h1 className="font-serif text-5xl md:text-6xl text-[var(--text-ivory)] uppercase">
                  {streakState.currentStreak} DAYS
                </h1>
                <div className="w-2 h-2 rounded-full bg-[var(--accent-gold)]" />
              </div>
              
              {/* Consistency Summary */}
              <div className="flex items-center gap-4 text-sm text-[var(--text-stone)]">
                <div>Total Kept: <span className="text-[var(--text-ivory)]">{totalKept}</span></div>
                <div className="w-1 h-1 rounded-full bg-[var(--border-default)]" />
                <div>Consistency Rate: <span className="text-[var(--text-ivory)]">{consistencyRate}%</span></div>
              </div>
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

      {/* Daily Reflection Section */}
      <section className="bg-[var(--bg-elevated)] border border-[var(--border-default)] p-4 rounded-[var(--radius-md)] flex flex-col gap-3">
        <h3 className="font-serif text-[var(--text-ivory)] tracking-[0.1em] uppercase text-sm">Daily Reflection</h3>
        {reflectionLoaded ? (
          <>
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              disabled={!editable || isSavingReflection}
              placeholder="Reflect on your day, challenges, or thoughts..."
              className="w-full h-24 bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-ivory)] placeholder:text-[var(--text-muted)] p-3 rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors resize-none text-sm"
            />
            {editable && (
              <div className="flex justify-end">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={handleSaveReflection}
                  disabled={isSavingReflection}
                >
                  {isSavingReflection ? "Saving..." : "Save Reflection"}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="h-24 w-full bg-[var(--bg-surface)] animate-pulse rounded-[var(--radius-sm)]" />
        )}
      </section>

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
