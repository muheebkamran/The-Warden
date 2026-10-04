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
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
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
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
    );
  }, { dependencies: [selectedDate, activeCommitments.length], scope: containerRef });

  const totalKept = records.filter(r => r.status === 'complete' || r.status === 'showed_up').length;
  const consistencyRate = records.length > 0 ? Math.round((totalKept / records.length) * 100) : 0;

  return (
    <div ref={containerRef} className="w-full max-w-3xl mx-auto flex flex-col gap-10 pb-20 animate-fade-in">
      <header className="flex flex-col gap-8">
        
        {/* Date Selector & Telemetry Readout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="flex gap-1.5 bg-[#131519] p-1 rounded-full border border-[#292c32] self-start">
            <button 
              onClick={() => setSelectedDate(todayStr)}
              className={cn(
                "px-5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-150 cursor-pointer",
                selectedDate === todayStr 
                  ? "bg-[#1a1d22] text-[#f2f0ea] border border-[#c8a96b]/40 font-medium" 
                  : "text-[#9a9a96] hover:text-[#f2f0ea]"
              )}
            >
              Today
            </button>
            <button 
              onClick={() => setSelectedDate(yesterdayStr)}
              className={cn(
                "px-5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-150 cursor-pointer",
                selectedDate === yesterdayStr 
                  ? "bg-[#1a1d22] text-[#f2f0ea] border border-[#c8a96b]/40 font-medium" 
                  : "text-[#9a9a96] hover:text-[#f2f0ea]"
              )}
            >
              Yesterday
            </button>
          </div>

          <div className="font-mono text-xs text-[#9a9a96] uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c8a96b]" />
            <span>{formatDate(selectedDate)}</span>
          </div>
        </div>

        {/* Monolithic Streak Counter (Lithos Aesthetic) */}
        <div>
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline gap-4">
              <h1 className="font-serif italic font-normal text-6xl sm:text-7xl md:text-8xl text-[#f2f0ea] tracking-tight leading-none">
                {streakState ? streakState.currentStreak : 0} 
                <span className="font-mono text-2xl sm:text-3xl text-[#9a9a96] not-italic ml-3 uppercase font-normal tracking-wide">
                  DAYS
                </span>
              </h1>
              <div className="w-2.5 h-2.5 rounded-full bg-[#c8a96b] animate-pulse" />
            </div>
            
            <div className="flex items-center gap-4 font-mono text-xs text-[#9a9a96] uppercase tracking-wider pt-1">
              <div>Total Kept: <span className="text-[#f2f0ea]">{totalKept}</span></div>
              <div className="w-1 h-1 rounded-full bg-[#292c32]" />
              <div>Consistency: <span className="text-[#c8a96b]">{consistencyRate}%</span></div>
            </div>
          </div>
        </div>

        {streakState?.graceDayActive && selectedDate === todayStr && (
          <div>
            <Badge variant="grace" className="px-3 py-1.5">
              1 GRACE DAY ACTIVE // BUFFER CONSUMED
            </Badge>
          </div>
        )}

        {/* Daily Target Progress Bar */}
        <div className="flex flex-col gap-3 bg-[#131519]/90 p-5 rounded-lg border border-[#3a3244]">
          <div className="font-mono text-xs text-[#9a9a96] uppercase tracking-wider flex justify-between">
            <span>DISCIPLINE TARGET</span>
            <span className={positive >= required ? "text-[#7fa889]" : "text-[#c8a96b]"}>
              {positive} / {required} ({total > 0 ? Math.round((positive / total) * 100) : 0}%)
            </span>
          </div>
          <div className="w-full h-2 bg-[#0b0c0e] rounded-full overflow-hidden border border-[#292c32]">
            <div 
              className={cn(
                "h-full transition-all duration-500 ease-out rounded-full",
                positive >= required ? "bg-[#7fa889]" : "bg-[#c8a96b]"
              )}
              style={{ width: `${Math.min(100, (positive / (required || 1)) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between font-mono text-[9px] text-[#62646a] tracking-wider uppercase">
            <span>0%</span>
            <span className="text-[#c8a96b]">70% THRESHOLD</span>
            <span>100%</span>
          </div>
        </div>
      </header>

      {/* Daily Reflection Section */}
      <section className="bg-[#131519]/90 border border-[#3a3244] p-6 rounded-lg flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl text-[#f2f0ea]">
            Daily Reflection
          </h3>
          <span className="font-mono text-[9px] text-[#c8a96b] uppercase tracking-widest">
            LEDGER ENTRY
          </span>
        </div>

        {reflectionLoaded ? (
          <>
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              disabled={!editable || isSavingReflection}
              placeholder="Record your friction, execution, or telemetry for today..."
              className={cn(
                "w-full h-24 bg-[#0b0c0e] border border-[#292c32] text-[#f2f0ea] placeholder:text-[#62646a] p-4 rounded-md transition-all duration-150 resize-none text-sm font-sans",
                "focus:outline-none focus:border-[#c8a96b] focus:ring-1 focus:ring-[#c8a96b]/30",
                "hover:border-[#3a3244]"
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
                  {isSavingReflection ? "Recording..." : "Save Entry"}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="h-24 w-full bg-[#1a1d22] animate-pulse rounded-md" />
        )}
      </section>

      {positive >= required && total > 0 && (
        <div className="text-[#c8a96b] font-serif italic text-2xl animate-fade-in text-center py-2">
          Day Complete. You kept your word.
        </div>
      )}

      {/* Main Commitments Feed */}
      <main className="flex flex-col gap-6">
        {activeCommitments.length === 0 ? (
          <EmptyState 
            title="No commitments active" 
            description="Add your first daily discipline rule to begin the ledger."
            action={<Button variant="primary" onClick={() => setIsAddModalOpen(true)}>Add Commitment</Button>}
          />
        ) : (
          <div className="flex flex-col gap-3.5" ref={cardsRef}>
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
