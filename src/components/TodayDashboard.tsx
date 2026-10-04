"use client";

import { useState, useEffect, useRef } from "react";
import CommitmentCard from "@/components/CommitmentCard";
import CommitmentModal from "@/components/CommitmentModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getDateEditability } from "@/lib/dateEngine";
import { saveReflection, getReflection } from "@/app/actions";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

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
  
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const activeCommitments = commitments.filter(c => c.isActive);
  const total = activeCommitments.length;
  const required = Math.ceil(0.70 * total);

  const selectedRecords = records.filter(r => r.date === selectedDate);
  const positive = selectedRecords.filter(r => r.status === 'complete' || r.status === 'showed_up').length;

  const status = getDateEditability(selectedDate);
  const editable = status === 'editable' || status === 'limited';
  
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

  // Staggered Entrance Animation
  useGSAP(() => {
    if (!cardsRef.current) return;
    const cards = gsap.utils.toArray(cardsRef.current.children);
    if (cards.length === 0) return;
    
    gsap.fromTo(
      cards,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "back.out(1.2)" }
    );
  }, { dependencies: [selectedDate, activeCommitments.length], scope: containerRef });

  const totalKept = records.filter(r => r.status === 'complete' || r.status === 'showed_up').length;
  const consistencyRate = records.length > 0 ? Math.round((totalKept / records.length) * 100) : 0;

  return (
    <div ref={containerRef} className="w-full max-w-3xl mx-auto flex flex-col gap-10 pb-20 animate-fade-in px-4 md:px-0">
      <header className="flex flex-col gap-8">
        <div className="flex items-center justify-between pt-4">
          <div className="flex gap-1 bg-surface p-1 rounded-full border border-border/50">
            <button 
              onClick={() => setSelectedDate(todayStr)}
              className={cn(
                "px-5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300",
                selectedDate === todayStr 
                  ? "bg-elevated text-ivory shadow-sm" 
                  : "text-stone hover:text-ivory"
              )}
            >
              Today
            </button>
            <button 
              onClick={() => setSelectedDate(yesterdayStr)}
              className={cn(
                "px-5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300",
                selectedDate === yesterdayStr 
                  ? "bg-elevated text-ivory shadow-sm" 
                  : "text-stone hover:text-ivory"
              )}
            >
              Yesterday
            </button>
          </div>
          <div className="text-stone text-sm font-medium">
            {formatDate(selectedDate)}
          </div>
        </div>

        <div>
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline gap-4">
              <h1 className="font-serif text-6xl md:text-7xl text-ivory uppercase tracking-tight">
                {streakState ? streakState.currentStreak : 0} <span className="text-4xl text-stone/70">DAYS</span>
              </h1>
              <div className="w-2.5 h-2.5 rounded-full bg-gold shadow-[0_0_12px_rgba(200,169,107,0.5)]" />
            </div>
            
            <div className="flex items-center gap-4 text-sm text-stone font-medium">
              <div>Total Kept: <span className="text-ivory">{totalKept}</span></div>
              <div className="w-1 h-1 rounded-full bg-border" />
              <div>Consistency Rate: <span className="text-ivory">{consistencyRate}%</span></div>
            </div>
          </div>
        </div>

        {streakState?.graceDayActive && selectedDate === todayStr && (
          <div>
            <Badge variant="grace" className="px-3 py-1.5 text-xs">
              1 GRACE DAY REMAINING
            </Badge>
          </div>
        )}

        <div className="flex flex-col gap-3 bg-surface p-4 rounded-md border border-border/50">
          <div className="text-stone text-xs font-medium uppercase tracking-wider flex justify-between">
            <span>Daily Target</span>
            <span>{positive} / {required}</span>
          </div>
          <div className="w-full h-1.5 bg-obsidian rounded-full overflow-hidden shadow-inner">
            <div 
              className={cn(
                "h-full transition-all duration-700 ease-out",
                positive >= required ? "bg-success" : "bg-gold"
              )}
              style={{ width: `${Math.min(100, (positive / (required || 1)) * 100)}%` }}
            />
          </div>
        </div>
      </header>

      <section className="bg-surface border border-border/50 p-5 rounded-md flex flex-col gap-4 shadow-sm">
        <h3 className="font-serif text-ivory tracking-[0.1em] uppercase text-sm font-semibold">Daily Reflection</h3>
        {reflectionLoaded ? (
          <>
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              disabled={!editable || isSavingReflection}
              placeholder="Reflect on your day, challenges, or thoughts..."
              className={cn(
                "w-full h-24 bg-obsidian/50 border border-border text-ivory placeholder:text-muted p-4 rounded-sm transition-all duration-300 resize-none text-sm",
                "focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold focus:bg-obsidian",
                "hover:border-stone/50"
              )}
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
          <div className="h-24 w-full bg-elevated animate-pulse rounded-sm" />
        )}
      </section>

      {positive >= required && total > 0 && (
        <div className="text-gold font-serif italic text-xl animate-fade-in text-center opacity-90">
          Day Complete. You kept your word.
        </div>
      )}

      <main className="flex flex-col gap-6">
        {activeCommitments.length === 0 ? (
          <EmptyState 
            title="No commitments yet" 
            description="Add your first daily commitment to begin."
            action={<Button variant="primary" onClick={() => setIsAddModalOpen(true)}>Add Commitment</Button>}
          />
        ) : (
          <div className="flex flex-col gap-3" ref={cardsRef}>
            {activeCommitments.map(commitment => {
              const record = selectedRecords.find(r => r.commitmentId === commitment.id);
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
            <div className="mt-6 text-center">
              <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(true)}>
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
