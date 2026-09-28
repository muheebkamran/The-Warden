"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";

interface WelcomeGreetingProps {
  name: string;
}

export function WelcomeGreeting({ name = "Muheeb" }: WelcomeGreetingProps) {
  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    // Show greeting smoothly on mount
    setRendered(true);
    const enterTimer = setTimeout(() => {
      setVisible(true);
    }, 150);

    // Auto-dismiss after 3.8 seconds
    const exitTimer = setTimeout(() => {
      setVisible(false);
    }, 4200);

    // Unmount after exit animation completes
    const unmountTimer = setTimeout(() => {
      setRendered(false);
    }, 4800);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  if (!rendered) return null;

  return (
    <div
      className={`fixed top-4 right-6 z-50 pointer-events-none transition-all duration-500 ease-out transform ${
        visible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 -translate-y-2 scale-95"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100">
        <div className="w-7 h-7 rounded-xl bg-[var(--brand,#2563eb)] text-[var(--brand-text,#ffffff)] flex items-center justify-center shrink-0 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold leading-tight tracking-tight">
            Welcome, {name}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Ready to keep your word today.
          </span>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition"
          aria-label="Dismiss greeting"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
