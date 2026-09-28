import React from "react";
import Sidebar from "./Sidebar";
import BottomBar from "./BottomBar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--bg-obsidian)]">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-[80px] md:pb-0 md:ml-[260px]">
        {children}
      </main>
      <BottomBar />
    </div>
  );
}
