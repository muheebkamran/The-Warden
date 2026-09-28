"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Plus,
  Edit2,
  Trash2,
  Clock,
  Sparkles,
  ArrowRight,
  LayoutGrid,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { createGoal, updateGoal, deleteGoal } from "@/app/actions";
import { getLocalTodayStr, getLocalYesterdayStr } from "@/lib/dateRules";

interface Goal {
  id: string;
  name: string;
  targetMinutes: number;
  active: boolean;
  createdAt: Date | string;
}

interface GoalRecord {
  id: string;
  goalId: string;
  targetMinutes: number;
  actualMinutes: number;
  showedUp: boolean;
}

interface DailyRecord {
  id: string;
  date: string;
  goals: GoalRecord[];
}

interface HabitsManagerProps {
  goals: Goal[];
  records: DailyRecord[];
}

export function HabitsManager({ goals, records }: HabitsManagerProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [targetMinutes, setTargetMinutes] = useState("30");
  const [isPending, startTransition] = useTransition();

  // Compute 7-day completion rate per goal
  const todayStr = getLocalTodayStr();
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  const handleOpenAdd = () => {
    setName("");
    setTargetMinutes("30");
    setEditingGoal(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setName(goal.name);
    setTargetMinutes(String(goal.targetMinutes));
    setIsAddModalOpen(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("targetMinutes", targetMinutes || "30");

    startTransition(async () => {
      if (editingGoal) {
        formData.append("goalId", editingGoal.id);
        await updateGoal(formData);
      } else {
        await createGoal(formData);
      }
      setIsAddModalOpen(false);
      setEditingGoal(null);
    });
  };

  const handleDelete = (goalId: string) => {
    startTransition(async () => {
      await deleteGoal(goalId);
      setDeletingGoalId(null);
    });
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-app,#f4f6fa)]">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-6 sm:px-8 py-5 sticky top-0 z-20 transition-colors">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-main,#0f172a)]">
                Disciplines & Habits
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--brand,#2563eb)]/10 text-[var(--brand,#2563eb)] border border-[var(--brand,#2563eb)]/20">
                Management
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted,#64748b)] mt-0.5">
              Inspect, customize, and configure your daily commitments. Powered by the same single source of truth.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/matrix"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition shadow-2xs"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>31-Day Matrix</span>
            </Link>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[var(--brand,#2563eb)] text-[var(--brand-text,#ffffff)] rounded-xl hover:opacity-90 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Discipline</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="p-6 sm:p-8 max-w-5xl mx-auto w-full flex-1 space-y-6">
        {/* Discipline List / Empty State */}
        {goals.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-800 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                No Disciplines Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Create a habit with a quantifiable daily target. It will instantly appear on your Home Command Center and Habit Matrix.
              </p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--brand,#2563eb)] text-[var(--brand-text,#ffffff)] font-bold text-xs rounded-xl shadow-sm hover:opacity-90 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Discipline</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
              <span>Active Disciplines ({goals.length})</span>
              <span>Last 7 Days Consistency</span>
            </div>

            <div className="space-y-3">
              {goals.map((goal) => {
                // Calculate past 7 days completion
                const dayStatus = past7Days.map((dateStr) => {
                  const rec = records.find((r) => r.date === dateStr);
                  const gr = rec?.goals.find((g) => g.goalId === goal.id);
                  const completed = !!(gr && (gr.showedUp || gr.actualMinutes > 0));
                  return { dateStr, completed };
                });

                const completedCount = dayStatus.filter((d) => d.completed).length;

                return (
                  <div
                    key={goal.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[var(--brand,#2563eb)]" />
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                          {goal.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          {goal.targetMinutes} minutes / day
                        </span>
                        <span>•</span>
                        <span>{completedCount}/7 days recently</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 shrink-0 self-end sm:self-center">
                      {/* 7-Day Mini Execution Dots */}
                      <div className="flex items-center gap-1.5" title="Last 7 days completion">
                        {dayStatus.map((d, i) => (
                          <div
                            key={i}
                            className={`w-3.5 h-3.5 rounded-md flex items-center justify-center text-[8px] font-bold ${
                              d.completed
                                ? "bg-[var(--brand,#2563eb)] text-[var(--brand-text,#ffffff)]"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600"
                            }`}
                            title={`${d.dateStr}: ${d.completed ? "Done" : "Missed"}`}
                          >
                            {d.completed && "✓"}
                          </div>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-4">
                        <button
                          onClick={() => handleOpenEdit(goal)}
                          className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Edit Discipline"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingGoalId(goal.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                          title="Delete Discipline"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">
              {editingGoal ? "Edit Discipline" : "Create New Discipline"}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {editingGoal
                ? "Update your daily target or discipline title."
                : "Add a habit to track on Home and the 31-day Matrix."}
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Discipline Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
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
                  value={targetMinutes}
                  onChange={(e) => setTargetMinutes(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                  placeholder="30"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-[var(--brand,#2563eb)] text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingGoal(null);
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending || !name.trim()}
                className="px-4 py-2 text-xs font-bold bg-[var(--brand,#2563eb)] text-[var(--brand-text,#ffffff)] rounded-xl hover:opacity-90 disabled:opacity-50 transition shadow-sm"
              >
                {isPending
                  ? "Saving..."
                  : editingGoal
                  ? "Save Changes"
                  : "Create Discipline"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingGoalId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">
              Delete Discipline?
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Are you sure? This will remove this discipline and its past records across Home, Habits, and the Matrix.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeletingGoalId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingGoalId)}
                disabled={isPending}
                className="px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-xl hover:bg-red-500 transition shadow-xs"
              >
                {isPending ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
