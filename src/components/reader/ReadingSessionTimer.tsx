"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { recordReadingSession } from '@/app/actions';
import { cn } from '@/lib/utils';

interface ReadingSessionTimerProps {
  bookId: string;
  currentPage: number;
  totalPages: number;
  targetMinutes?: number;
  onSessionSaved?: () => void;
}

export function ReadingSessionTimer({
  bookId,
  currentPage,
  totalPages,
  targetMinutes = 30,
  onSessionSaved,
}: ReadingSessionTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const minutesRead = Math.floor(seconds / 60);
  const displayMinutes = String(minutesRead).padStart(2, '0');
  const displaySeconds = String(seconds % 60).padStart(2, '0');
  const progressRatio = Math.min(100, Math.round((minutesRead / targetMinutes) * 100));
  const targetReached = minutesRead >= targetMinutes;

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(0);
    setIsSaved(false);
  };

  const handleSaveSession = () => {
    if (seconds < 30) return; // Ignore accidental clicks under 30s
    setIsActive(false);

    startTransition(async () => {
      try {
        await recordReadingSession(bookId, Math.max(1, minutesRead), currentPage, totalPages);
        setIsSaved(true);
        onSessionSaved?.();
        setTimeout(() => setIsSaved(false), 4000);
      } catch (err) {
        console.error('Failed to log reading session:', err);
      }
    });
  };

  return (
    <div className="flex items-center gap-3 bg-surface/90 border border-border/80 px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-2">
        <Clock className={cn("w-3.5 h-3.5", isActive ? "text-gold animate-pulse" : "text-stone")} />
        <span className="font-mono text-xs font-semibold text-ivory tracking-wider">
          {displayMinutes}:{displaySeconds}
        </span>
        <span className="text-[10px] text-muted font-mono">/ {targetMinutes}m</span>
      </div>

      <div className="h-3 w-[1px] bg-border/60" />

      {/* Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleTimer}
          className={cn(
            "p-1.5 rounded-full transition-all duration-200",
            isActive
              ? "bg-warning/20 text-warning hover:bg-warning/30"
              : "bg-gold text-obsidian hover:bg-gold-hover shadow-sm"
          )}
          title={isActive ? "Pause Reading Session" : "Start Reading Session"}
        >
          {isActive ? <Pause className="w-3 h-3 stroke-[2.5]" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
        </button>

        {seconds > 0 && (
          <button
            onClick={resetTimer}
            className="p-1.5 rounded-full text-stone hover:text-ivory hover:bg-elevated transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}

        {seconds >= 60 && (
          <button
            onClick={handleSaveSession}
            disabled={isPending}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ml-1",
              targetReached
                ? "bg-success text-obsidian shadow-sm animate-bounce"
                : "bg-elevated text-gold border border-gold/40 hover:bg-gold/10"
            )}
            title="Log session to habit tracker"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>{isPending ? 'Syncing...' : 'Sync Session'}</span>
          </button>
        )}
      </div>

      {isSaved && (
        <span className="text-[10px] text-success font-medium flex items-center gap-1 animate-fade-in">
          <Sparkles className="w-3 h-3" /> Commitment Updated!
        </span>
      )}
    </div>
  );
}
