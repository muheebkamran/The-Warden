"use client";

import React, { useState } from "react";
import { Plus, Target, Trash2, CheckCircle2, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { createFinancialGoal, updateFinancialGoalProgress, deleteFinancialGoal } from "@/app/actions";

interface FinancialGoalItem {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  targetDate: string | null;
  isCompleted: boolean;
  createdAt: Date | string;
}

interface FortressGoalsProps {
  goals: FinancialGoalItem[];
  currency: string;
}

const CATEGORIES = [
  { id: "fortress", label: "Financial Fortress (Runway)" },
  { id: "emergency_fund", label: "Emergency Reserve" },
  { id: "investment", label: "Long-Term Investment" },
  { id: "debt_freedom", label: "Debt Annihilation" },
];

export function FortressGoals({ goals, currency }: FortressGoalsProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [depositModalGoal, setDepositModalGoal] = useState<FinancialGoalItem | null>(null);
  const [depositAmount, setDepositAmount] = useState("");

  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [category, setCategory] = useState("fortress");
  const [targetDate, setTargetDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount) return;

    setIsSubmitting(true);
    try {
      await createFinancialGoal({
        title,
        targetAmount: parseFloat(targetAmount),
        currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
        category,
        targetDate: targetDate || undefined,
      });
      setTitle("");
      setTargetAmount("");
      setCurrentAmount("");
      setTargetDate("");
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModalGoal || !depositAmount) return;

    setIsSubmitting(true);
    try {
      await updateFinancialGoalProgress(depositModalGoal.id, parseFloat(depositAmount), true);
      setDepositAmount("");
      setDepositModalGoal(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm("Delete this financial goal?")) return;
    try {
      await deleteFinancialGoal(goalId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-surface border border-border">
        <div>
          <h3 className="text-base font-serif font-semibold text-ivory tracking-wide flex items-center gap-2">
            <Target className="w-5 h-5 text-gold" />
            Financial Fortress & Savings Milestones
          </h3>
          <p className="text-xs text-stone mt-1">
            Build unshakeable peace of mind. Every dollar fortified buys future autonomy.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gold text-obsidian text-xs font-semibold rounded-lg hover:bg-gold/90 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Fortress Goal
        </button>
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-surface border border-border rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="text-sm font-serif font-bold text-ivory flex items-center gap-2">
                <Target className="w-4 h-4 text-gold" />
                New Financial Fortress Goal
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone hover:text-ivory text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 6-Month Emergency Runway"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-border rounded-lg text-ivory text-sm focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
                    Target ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="10000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-obsidian border border-border rounded-lg text-ivory text-sm focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
                    Current Balance ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="2500"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-obsidian border border-border rounded-lg text-ivory text-sm focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-border rounded-lg text-ivory text-sm focus:outline-none focus:border-gold"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
                  Target Date (Optional)
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-border rounded-lg text-ivory text-sm focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-stone hover:text-ivory transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gold text-obsidian text-xs font-semibold rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Establish Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Funds Modal */}
      {depositModalGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-surface border border-border rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="text-sm font-serif font-bold text-ivory">
                Deposit to {depositModalGoal.title}
              </h4>
              <button
                onClick={() => setDepositModalGoal(null)}
                className="text-stone hover:text-ivory text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
                  Contribution Amount ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="250.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-border rounded-lg text-ivory text-sm focus:outline-none focus:border-gold"
                  autoFocus
                />
              </div>

              <div className="text-xs text-stone">
                Current: {currency}{depositModalGoal.currentAmount.toLocaleString()} · Target: {currency}{depositModalGoal.targetAmount.toLocaleString()}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setDepositModalGoal(null)}
                  className="px-4 py-2 text-xs text-stone hover:text-ivory transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-500 text-obsidian text-xs font-semibold rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Updating..." : "Add Capital"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="p-8 rounded-xl bg-surface/50 border border-border/60 text-center space-y-2">
          <Target className="w-8 h-8 text-stone/40 mx-auto" />
          <p className="text-sm text-stone font-medium">No fortress goals established yet</p>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Establish your 6-month emergency reserve or high-conviction savings milestones to build true sovereign freedom.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => {
            const percent = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
            const remaining = Math.max(0, g.targetAmount - g.currentAmount);

            return (
              <div
                key={g.id}
                className={`p-5 rounded-xl bg-surface border transition-all flex flex-col justify-between ${
                  g.isCompleted
                    ? "border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.06)]"
                    : "border-border hover:border-border/80"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-ivory">{g.title}</h4>
                      <span className="text-[10px] uppercase tracking-wider text-muted font-medium capitalize">
                        {g.category.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {g.isCompleted && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Achieved
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(g.id)}
                        className="text-stone/50 hover:text-rose-400 p-1 transition-colors"
                        title="Delete goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="text-2xl font-serif font-bold text-ivory">
                      {currency}{g.currentAmount.toLocaleString()}
                    </span>
                    <span className="text-xs text-stone">
                      Target: {currency}{g.targetAmount.toLocaleString()}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 w-full bg-elevated rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        g.isCompleted
                          ? "bg-emerald-400"
                          : percent > 60
                          ? "bg-gold"
                          : "bg-stone"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
                    <span>{percent}% funded</span>
                    <span>
                      {g.isCompleted ? "Goal Completed" : `${currency}${remaining.toLocaleString()} remaining`}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between">
                  {g.targetDate ? (
                    <span className="text-[11px] text-stone flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-muted" />
                      Target: {new Date(g.targetDate + "T00:00:00").toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted">No deadline</span>
                  )}

                  <button
                    onClick={() => setDepositModalGoal(g)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-elevated hover:bg-surface text-stone hover:text-ivory border border-border rounded-lg text-xs font-medium transition-colors"
                  >
                    <Plus className="w-3 h-3 text-gold" />
                    Deposit Funds
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
