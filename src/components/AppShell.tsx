"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import BottomBar from "./BottomBar";
import Background3D from "./Background3D";
import { Menu, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-[#0b0c0e] text-[#f2f0ea] selection:bg-[#c8a96b]/30 selection:text-[#f2f0ea] relative font-sans antialiased overflow-x-hidden">
      <Background3D />
      
      {/* ─── Lithos Top Navigation Bar ──────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 h-16 md:h-20 bg-[#0b0c0e]/85 backdrop-blur-xl border-b border-[#292c32]/80 flex items-center justify-between px-4 sm:px-6 z-40 transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-[#9a9a96] hover:text-[#f2f0ea] hover:bg-[#1a1d22] transition-colors rounded-sm focus:outline-none"
            aria-label="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-[#1a1d22] border border-[#3a3244] flex items-center justify-center text-[#c8a96b]">
              <Shield size={17} />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-sm md:text-base tracking-[0.22em] uppercase font-semibold text-[#f2f0ea]">
                The Warden
              </span>
              <span className="font-mono text-[9px] tracking-widest text-[#9a9a96] uppercase -mt-0.5">
                Lithos Engine
              </span>
            </div>
          </div>
        </div>

        {/* Right Status Readout */}
        <div className="hidden sm:flex items-center gap-3 font-mono text-[10px] tracking-widest text-[#9a9a96] uppercase">
          <span className="w-2 h-2 rounded-full bg-[#7fa889] animate-pulse" />
          <span>LEDGER: ACTIVE</span>
          <span className="text-[#3a3244]">|</span>
          <span className="text-[#c8a96b]">V2.4</span>
        </div>
      </header>

      <Sidebar isOpen={sidebarOpen} />
      
      <main 
        className={cn(
          "flex-1 min-w-0 pt-20 md:pt-24 pb-[80px] md:pb-12 transition-all duration-300 relative z-10 px-4 sm:px-6 md:px-8",
          sidebarOpen ? "md:ml-[260px]" : "ml-0"
        )}
      >
        {children}
      </main>
      
      <BottomBar />
    </div>
  );
}
