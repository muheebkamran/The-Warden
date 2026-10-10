"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutGrid, 
  ListChecks, 
  Plus, 
  TrendingUp, 
  Landmark, 
  X, 
  Sparkles, 
  Receipt, 
  CheckCircle2 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomBar() {
  const pathname = usePathname();
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close quick menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setQuickMenuOpen(false);
      }
    }
    if (quickMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [quickMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setQuickMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* ─── Apple Tactile Floating Action Menu ────────────────────────────── */}
      {quickMenuOpen && (
        <div 
          ref={menuRef}
          className="fixed bottom-22 left-1/2 -translate-x-1/2 z-50 flex md:hidden flex-col gap-2 p-2 bg-[#141416]/95 backdrop-blur-2xl border border-[#2A2A32] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-150 w-56 select-none"
        >
          <div className="px-3 py-1.5 border-b border-[#222228] flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 font-bold">
              Quick Protocol
            </span>
            <button 
              onClick={() => setQuickMenuOpen(false)}
              className="text-zinc-500 hover:text-white p-0.5 rounded cursor-pointer"
              aria-label="Close menu"
            >
              <X size={13} />
            </button>
          </div>

          <Link
            href="/dashboard"
            onClick={() => setQuickMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-zinc-200 hover:text-white hover:bg-[#1F1F26] rounded-xl transition-all active:scale-[0.98]"
          >
            <CheckCircle2 size={16} className="text-[#00D664]" />
            <span>Mark Daily Habit</span>
          </Link>

          <Link
            href="/finance"
            onClick={() => setQuickMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-zinc-200 hover:text-white hover:bg-[#1F1F26] rounded-xl transition-all active:scale-[0.98]"
          >
            <Receipt size={16} className="text-[#FFFC00]" />
            <span>Log Daily Outflow</span>
          </Link>

          <Link
            href="/habits"
            onClick={() => setQuickMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-zinc-200 hover:text-white hover:bg-[#1F1F26] rounded-xl transition-all active:scale-[0.98]"
          >
            <Sparkles size={16} className="text-cyan-400" />
            <span>Commission New Habit</span>
          </Link>
        </div>
      )}

      {/* ─── Floating Sovereign Island Dock (Matching Reference Screenshot) ──── */}
      <nav 
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex md:hidden items-center gap-1.5 p-1.5 bg-[#141416]/90 backdrop-blur-2xl border border-[#26262B] rounded-full shadow-[0_16px_40px_rgba(0,0,0,0.85)] select-none"
        aria-label="Mobile Navigation"
      >
        {/* 1. Dashboard (4-Squares Grid) */}
        <Link
          href="/dashboard"
          className={cn(
            "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-150 active:scale-[0.90]",
            pathname === "/dashboard"
              ? "bg-[#202026] text-[#FFFC00] shadow-inner"
              : "text-zinc-400 hover:text-white hover:bg-[#1A1A20]"
          )}
          aria-label="Dashboard"
        >
          <LayoutGrid size={20} className={pathname === "/dashboard" ? "fill-current" : ""} />
        </Link>

        {/* 2. Habits (Double Checkmarks) */}
        <Link
          href="/habits"
          className={cn(
            "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-150 active:scale-[0.90]",
            pathname === "/habits"
              ? "bg-[#202026] text-[#FFFC00] shadow-inner"
              : "text-zinc-400 hover:text-white hover:bg-[#1A1A20]"
          )}
          aria-label="Habits"
        >
          <ListChecks size={20} />
        </Link>

        {/* 3. Center Elevated Action Button (+) with Snap Yellow Radial Glow */}
        <button
          type="button"
          onClick={() => setQuickMenuOpen(!quickMenuOpen)}
          className={cn(
            "w-11 h-11 rounded-full bg-[#FFFC00] text-black flex items-center justify-center font-black transition-all duration-150 cursor-pointer shadow-[0_0_24px_rgba(255,252,0,0.45)] active:scale-[0.90] hover:scale-105",
            quickMenuOpen ? "rotate-45" : "rotate-0"
          )}
          aria-label="Quick Action Trigger"
        >
          <Plus size={22} strokeWidth={2.8} />
        </button>

        {/* 4. Progress (Ascending Chart) */}
        <Link
          href="/progress"
          className={cn(
            "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-150 active:scale-[0.90]",
            pathname === "/progress"
              ? "bg-[#202026] text-[#FFFC00] shadow-inner"
              : "text-zinc-400 hover:text-white hover:bg-[#1A1A20]"
          )}
          aria-label="Progress"
        >
          <TrendingUp size={20} />
        </Link>

        {/* 5. Finance (Landmark Edifice) */}
        <Link
          href="/finance"
          className={cn(
            "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-150 active:scale-[0.90]",
            pathname === "/finance"
              ? "bg-[#202026] text-[#FFFC00] shadow-inner"
              : "text-zinc-400 hover:text-white hover:bg-[#1A1A20]"
          )}
          aria-label="Finance"
        >
          <Landmark size={20} />
        </Link>
      </nav>
    </>
  );
}
