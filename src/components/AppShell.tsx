"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import BottomBar from "./BottomBar";
import { Menu } from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-[var(--bg-obsidian)]">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 h-14 md:h-16 bg-[var(--bg-obsidian)] border-b border-[var(--border-default)] flex items-center px-4 z-40">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-[var(--text-stone)] hover:text-[var(--text-ivory)] transition-colors rounded-[var(--radius-sm)]"
          aria-label="Toggle Sidebar"
        >
          <Menu size={20} />
        </button>
        <div className="ml-4">
          <h1 className="font-serif text-sm md:text-base tracking-[0.2em] uppercase text-[var(--text-ivory)]">
            The Warden
          </h1>
        </div>
      </header>

      <Sidebar isOpen={sidebarOpen} />
      
      <main 
        className={`flex-1 min-w-0 pt-14 md:pt-16 pb-[80px] md:pb-0 transition-all duration-300 ${
          sidebarOpen ? "md:ml-[260px]" : "ml-0"
        }`}
      >
        {children}
      </main>
      <BottomBar />
    </div>
  );
}
