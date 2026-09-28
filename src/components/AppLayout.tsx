"use client";

import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { computeThemeStyleString } from "@/lib/theme";

interface AppLayoutProps {
  children: React.ReactNode;
  goals?: { id: string; name: string; targetMinutes: number }[];
  activeGoalId?: string;
  onSelectGoal?: (goalId: string) => void;
  userSettings?: {
    name?: string;
    accentColor?: string;
    backgroundColor?: string;
  } | null;
}

export function AppLayout({
  children,
  goals = [],
  activeGoalId,
  onSelectGoal,
  userSettings,
}: AppLayoutProps) {
  const accent = userSettings?.accentColor || "#2563eb";
  const bg = userSettings?.backgroundColor || "#f4f6fa";
  const themeCss = computeThemeStyleString({ accentColor: accent, backgroundColor: bg });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `:root { ${themeCss} }` }} />
      <div className="flex min-h-screen bg-[var(--bg-app,#f4f6fa)] text-[var(--text-main,#0f172a)] font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors duration-200">
        {/* Canonical Unified Sidebar */}
        <Sidebar
          goals={goals}
          activeGoalId={activeGoalId}
          onSelectGoal={onSelectGoal}
          userName={userSettings?.name || "Muheeb"}
        />

        {/* Main App Content Canvas */}
        <main className="flex-1 flex flex-col min-w-0 bg-[var(--bg-app,#f4f6fa)] overflow-y-auto min-h-screen transition-colors duration-200">
          {children}
        </main>
      </div>
    </>
  );
}
