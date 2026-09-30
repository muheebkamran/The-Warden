"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import BottomBar from "./BottomBar";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-obsidian">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 h-14 md:h-16 bg-obsidian/95 backdrop-blur-md border-b border-border flex items-center px-4 z-40 transition-colors">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-stone hover:text-ivory hover:bg-surface transition-colors rounded-sm"
          aria-label="Toggle Sidebar"
        >
          <Menu size={20} />
        </button>
        <div className="ml-4">
          <h1 className="font-serif text-sm md:text-base tracking-[0.2em] uppercase text-ivory">
            The Warden
          </h1>
        </div>
      </header>

      <Sidebar isOpen={sidebarOpen} />
      
      <main 
        className={cn(
          "flex-1 min-w-0 pt-14 md:pt-16 pb-[80px] md:pb-0 transition-all duration-300",
          sidebarOpen ? "md:ml-[260px]" : "ml-0"
        )}
      >
        {children}
      </main>
      <BottomBar />
    </div>
  );
}
