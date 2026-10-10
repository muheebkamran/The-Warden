"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import Sidebar from "./Sidebar";
import BottomBar from "./BottomBar";
import { Menu, Clock, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const Background3D = dynamic(() => import("./Background3D"), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 z-[-1] pointer-events-none" />
});

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState("EST 09:41:22");

  // Keep time updated
  useEffect(() => {
    function updateClock() {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", { 
        hour12: false, 
        hour: "2-digit", 
        minute: "2-digit", 
        second: "2-digit" 
      });
      setCurrentTime(`EST ${timeStr}`);
    }
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Default sidebar to open on desktop (>= 1024px), closed on mobile (< 1024px)
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  // Dynamic Sector Breadcrumb Title matching Screenshots 1-5
  const getSectorBreadcrumb = () => {
    if (pathname.startsWith("/progress")) {
      return "PROGRESS & TELEMETRY // DISCIPLINE TRAJECTORY";
    }
    if (pathname.startsWith("/finance")) {
      return "MONEY & BILLS // FINANCIAL TELEMETRY";
    }
    if (pathname.startsWith("/settings")) {
      return "SETTINGS // SYSTEM CONTROL & VAULT ARCHITECTURE";
    }
    if (pathname.startsWith("/habits")) {
      return "HABIT DIRECTIVES // ARCHITECTURE VAULT";
    }
    return "SYSTEM ARCHIVE // OBSIDIAN VAULT";
  };

  return (
    <div className="flex min-h-screen bg-[#0E0E10] text-white selection:bg-[#FFFC00] selection:text-black relative font-sans antialiased overflow-x-hidden">
      <Background3D />
      
      {/* ─── Persistent Top Header Bar (Matching Screenshots 1-5) ───────────── */}
      <header className="fixed top-0 left-0 right-0 h-16 md:h-16 bg-[#0E0E10]/90 backdrop-blur-xl border-b border-[#222227] flex items-center justify-between px-4 sm:px-6 lg:px-8 z-40 transition-colors select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#1A1A1E] transition-colors rounded-xl focus:outline-none cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            <Menu size={18} />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-black border border-[#2E2E34] overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
              <img src="/logo.png" alt="The Warden" className="w-full h-full object-contain" />
            </div>
            <span className="font-mono text-[10px] sm:text-[11px] font-bold tracking-widest text-zinc-400 uppercase truncate max-w-[280px] sm:max-w-none">
              {getSectorBreadcrumb()}
            </span>
          </div>
        </div>

        {/* Right Status Readouts: Clock, Alerts, Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Digital Clock Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#1C1C20] border border-[#2E2E35] rounded-full font-mono text-[11px] text-zinc-300 font-medium">
            <Clock className="w-3.5 h-3.5 text-[#FFFC00]" />
            <span>{currentTime}</span>
          </div>

          {/* Alert Notification Bell */}
          <button 
            type="button"
            className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1C1C20] border border-[#2E2E35] flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Alerts"
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF2D55] ring-2 ring-[#1C1C20]" />
          </button>

          {/* Operator Avatar Circle */}
          <div className="relative">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5">
              <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center font-bold text-xs text-[#FFFC00]">
                OP
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#00D664] border-2 border-[#101012] rounded-full" />
          </div>
        </div>
      </header>

      {/* Mobile Drawer Backdrop Scrim */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity" 
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar isOpen={sidebarOpen} />
      
      <main 
        className={cn(
          "flex-1 min-w-0 pt-20 pb-[96px] md:pb-16 transition-all duration-300 relative z-10 px-4 sm:px-6 md:px-8",
          sidebarOpen ? "lg:ml-[270px]" : "ml-0"
        )}
      >
        {children}
      </main>
      
      <BottomBar />
    </div>
  );
}
