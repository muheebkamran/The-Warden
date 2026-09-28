"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Home,
  CheckSquare,
  LayoutGrid,
  TrendingUp,
  BookOpen,
  ShieldCheck,
  Activity,
  Settings,
  Plus,
  Sparkles,
} from "lucide-react";
import { createGoal } from "@/app/actions";

interface SidebarProps {
  goals?: { id: string; name: string; targetMinutes: number }[];
  activeGoalId?: string;
  onSelectGoal?: (goalId: string) => void;
  userName?: string;
}

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/habits", label: "Habits", icon: CheckSquare },
  { href: "/matrix", label: "Habit Matrix", icon: LayoutGrid },
  { href: "/dashboard", label: "Dashboard", icon: TrendingUp },
  { href: "/reader", label: "Reading Room", icon: BookOpen },
  { href: "/vault", label: "Promise Vault", icon: ShieldCheck },
  { href: "/trends", label: "Trends & Biometrics", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  goals = [],
  activeGoalId,
  onSelectGoal,
  userName = "Muheeb",
}: SidebarProps) {
  const pathname = usePathname();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [habitName, setHabitName] = useState("");
  const [targetMin, setTargetMin] = useState("30");
  const [isPending, startTransition] = useTransition();

  const handleAddHabit = () => {
    if (!habitName.trim()) return;
    const formData = new FormData();
    formData.append("name", habitName.trim());
    formData.append("targetMinutes", targetMin || "30");

    startTransition(async () => {
      await createGoal(formData);
      setHabitName("");
      setTargetMin("30");
      setIsAddModalOpen(false);
    });
  };

  return (
    <>
      <aside className="w-64 bg-[var(--sidebar-bg,#1a1f2c)] text-zinc-200 flex flex-col justify-between shrink-0 border-r border-[var(--sidebar-border,#262e3d)] h-screen sticky top-0 z-30 select-none">
        <div className="p-4 flex flex-col flex-1 overflow-y-auto scrollbar-thin">
          {/* Brand Header */}
          <Link
            href="/"
            className="flex items-center gap-3 px-2 py-3 mb-5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--brand,#2563eb)] text-[var(--brand-text,#ffffff)] flex items-center justify-center font-black text-sm shadow-sm shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white tracking-widest uppercase">
                THE WARDEN
              </p>
              <p className="text-[11px] text-zinc-400 truncate">
                Keep Your Word
              </p>
            </div>
          </Link>

          {/* Canonical Navigation Links */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? "bg-[var(--brand,#2563eb)] text-[var(--brand-text,#ffffff)] shadow-md"
                      : "text-zinc-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Habit Switcher Section (if habits exist) */}
          {goals.length > 0 && (
            <div className="mt-6 pt-5 border-t border-white/10">
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Disciplines ({goals.length})
                </span>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="text-zinc-400 hover:text-white p-1 rounded transition"
                  title="Add Discipline"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                {goals.map((g) => {
                  const isSelected = activeGoalId === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => {
                        if (onSelectGoal) onSelectGoal(g.id);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition group text-left ${
                        isSelected
                          ? "bg-white/15 text-white border border-white/20 font-semibold"
                          : "text-zinc-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isSelected
                              ? "bg-[var(--brand,#2563eb)]"
                              : "bg-zinc-500 group-hover:bg-zinc-300"
                          }`}
                        />
                        <span className="truncate">{g.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {g.targetMinutes}m
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Quick Action & Profile Link */}
        <div className="p-3 border-t border-[var(--sidebar-border,#262e3d)] text-xs space-y-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 rounded-xl transition font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Discipline</span>
          </button>

          <Link
            href="/settings"
            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/10 transition group"
            title="User Profile & Settings"
          >
            <div className="w-7 h-7 rounded-lg bg-[var(--brand,#2563eb)] text-[var(--brand-text,#ffffff)] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate group-hover:text-zinc-200">
                {userName}
              </p>
              <p className="text-[10px] text-zinc-400 truncate">Settings & Theme</p>
            </div>
            <Settings className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white shrink-0" />
          </Link>
        </div>
      </aside>

      {/* Add Habit Modal (Available from any page via sidebar) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">
              Add New Daily Discipline
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Commit to a measurable standard every single day.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Discipline Name
                </label>
                <input
                  type="text"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddHabit();
                  }}
                  placeholder="e.g. Read 20 pages, Deep Work, Boxing"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-[var(--brand,#2563eb)] text-slate-900 dark:text-slate-100"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Target Minutes / Day
                </label>
                <input
                  type="number"
                  value={targetMin}
                  onChange={(e) => setTargetMin(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddHabit();
                  }}
                  placeholder="30"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-[var(--brand,#2563eb)] text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddHabit}
                disabled={isPending || !habitName.trim()}
                className="px-4 py-2 text-xs font-bold bg-[var(--brand,#2563eb)] text-[var(--brand-text,#ffffff)] rounded-xl hover:opacity-90 disabled:opacity-50 transition shadow-sm"
              >
                {isPending ? "Adding..." : "Add Discipline"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
