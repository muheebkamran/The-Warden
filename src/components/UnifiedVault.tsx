"use client";

import { useState, useTransition } from "react";
import {
  ShieldCheck,
  Plus,
  Check,
  X,
  Trash2,
  Calendar,
  Lock,
  AlertCircle,
} from "lucide-react";
import { createPromise, keepPromise, missPromise, deletePromise } from "@/app/actions";
import { EmptyState } from "@/components/EmptyState";
import { getEntryDateStatus, getLocalTodayStr, getLocalYesterdayStr } from "@/lib/dateRules";

interface PromiseItem {
  id: string;
  text: string;
  status: string;
  date: string;
  targetMinutes: number | null;
  actualMinutes: number;
  notes: string | null;
  keptAt: Date | string | null;
}

interface UnifiedVaultProps {
  promises: PromiseItem[];
  longestStreak: number;
  todayStr: string;
}

export function UnifiedVault({
  promises,
  longestStreak,
  todayStr,
}: UnifiedVaultProps) {
  const yesterdayStr = getLocalYesterdayStr();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [filter, setFilter] = useState<"all" | "kept" | "missed">("all");
  const [newText, setNewText] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [vaultFeedback, setVaultFeedback] = useState<string | null>(null);
  const [isPendingCreate, startCreateTransition] = useTransition();
  const [isPendingAction, startActionTransition] = useTransition();

  const totalPromised = promises.length;
  const totalKept = promises.filter((p) => p.status === "kept").length;
  const commitmentRate =
    totalPromised > 0 ? Math.round((totalKept / totalPromised) * 100) : 0;

  const handleCreatePromise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const validation = getEntryDateStatus(selectedDate);
    if (!validation.allowed) {
      setVaultFeedback(validation.message);
      setTimeout(() => setVaultFeedback(null), 4000);
      return;
    }

    const formData = new FormData();
    formData.append("text", newText.trim());
    formData.append("date", selectedDate);
    if (newTarget.trim()) {
      formData.append("targetMinutes", newTarget.trim());
    }

    startCreateTransition(async () => {
      try {
        await createPromise(formData);
        setNewText("");
        setNewTarget("");
      } catch (err: any) {
        setVaultFeedback(err?.message || "Promise entry rejected.");
        setTimeout(() => setVaultFeedback(null), 4000);
      }
    });
  };

  const handleKeep = (promiseId: string, promiseDate: string) => {
    const validation = getEntryDateStatus(promiseDate);
    if (!validation.allowed) {
      setVaultFeedback(validation.message);
      setTimeout(() => setVaultFeedback(null), 4000);
      return;
    }

    const formData = new FormData();
    formData.append("promiseId", promiseId);
    startActionTransition(async () => {
      try {
        await keepPromise(formData);
      } catch (err: any) {
        setVaultFeedback(err?.message || "Action rejected.");
        setTimeout(() => setVaultFeedback(null), 4000);
      }
    });
  };

  const handleMiss = (promiseId: string, promiseDate: string) => {
    const validation = getEntryDateStatus(promiseDate);
    if (!validation.allowed) {
      setVaultFeedback(validation.message);
      setTimeout(() => setVaultFeedback(null), 4000);
      return;
    }

    startActionTransition(async () => {
      try {
        await missPromise(promiseId);
      } catch (err: any) {
        setVaultFeedback(err?.message || "Action rejected.");
        setTimeout(() => setVaultFeedback(null), 4000);
      }
    });
  };

  const handleDelete = (promiseId: string, promiseDate: string) => {
    const validation = getEntryDateStatus(promiseDate);
    if (!validation.allowed) {
      setVaultFeedback(validation.message);
      setTimeout(() => setVaultFeedback(null), 4000);
      return;
    }

    startActionTransition(async () => {
      try {
        await deletePromise(promiseId);
      } catch (err: any) {
        setVaultFeedback(err?.message || "Action rejected.");
        setTimeout(() => setVaultFeedback(null), 4000);
      }
    });
  };


  const filteredPromises =
    filter === "all"
      ? promises
      : promises.filter((p) => p.status === filter);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Top Header Bar */}
      <header className="h-16 bg-white border-b border-zinc-200 px-8 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Promise Vault
          </h1>
          <p className="text-xs text-zinc-500">
            I do what I say I&apos;ll do — Historical Evidence Deck
          </p>
        </div>
      </header>

      {/* Main Body */}
      <div className="p-8 max-w-5xl mx-auto w-full flex-1 space-y-6">
        {/* Top 4 KPI Metrics in Clean White Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Promises Made
            </span>
            <span className="text-3xl font-black text-zinc-900 font-mono">
              {totalPromised}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Promises Kept
            </span>
            <span className="text-3xl font-black text-blue-600 font-mono">
              {totalKept}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Commitment Rate
            </span>
            <span className="text-3xl font-black text-zinc-900 font-mono">
              {commitmentRate}%
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Longest Streak
            </span>
            <span className="text-3xl font-black text-zinc-900 font-mono">
              {longestStreak}d
            </span>
          </div>
        </div>

        {/* Strict Date Entry Feedback Alert */}
        {vaultFeedback && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-medium">{vaultFeedback}</span>
            </div>
            <button
              onClick={() => setVaultFeedback(null)}
              className="text-amber-700 hover:text-amber-950 font-bold ml-2 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Create Commitment Card */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="font-bold text-sm text-zinc-900">
                Make a Daily Commitment
              </h3>
              <p className="text-xs text-zinc-500">
                Entries can only be made for Today or Yesterday (late entry).
              </p>
            </div>

            {/* Date Target Selector: Strictly Today or Yesterday */}
            <div className="flex items-center gap-1.5 bg-zinc-50 p-1 border border-zinc-200 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setSelectedDate(todayStr)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  selectedDate === todayStr
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                Today ({todayStr})
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate(yesterdayStr)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  selectedDate === yesterdayStr
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                Yesterday ({yesterdayStr})
              </button>
            </div>
          </div>

          <form onSubmit={handleCreatePromise} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="e.g. Study Python 2 hours, Exercise 30m, Read 20 pages"
              required
              className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-blue-600"
            />
            <input
              type="number"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              placeholder="Target min (optional)"
              className="w-full sm:w-44 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-blue-600 text-right"
            />
            <button
              type="submit"
              disabled={isPendingCreate || !newText.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs whitespace-nowrap transition disabled:opacity-50 shadow-xs"
            >
              {isPendingCreate ? "Committing..." : `Commit for ${selectedDate === todayStr ? "Today" : "Yesterday"}`}
            </button>
          </form>
        </div>

        {/* History List or Empty State */}
        {promises.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="Your Promise Vault is Empty"
            description="Start building your personal evidence record. When you make a commitment above and fulfill it, your historical evidence ledger grows here."
          />
        ) : (
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4">
            {/* Filter Pills */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-1">
                {(["all", "kept", "missed"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                      filter === f
                        ? "bg-blue-600 text-white shadow-xs font-bold"
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <span className="text-xs text-zinc-400 font-mono">
                {filteredPromises.length} entries
              </span>
            </div>

            {/* Promise Items */}
            <div className="divide-y divide-zinc-100">
              {filteredPromises.map((p) => {
                const isKept = p.status === "kept";
                const isMissed = p.status === "missed";
                const isPending = p.status === "pending";
                const rule = getEntryDateStatus(p.date);
                const isModifiable = rule.allowed;

                return (
                  <div
                    key={p.id}
                    className="py-3.5 flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                          isKept
                            ? "bg-blue-600 text-white"
                            : isMissed
                            ? "bg-red-100 text-red-600"
                            : "bg-zinc-100 text-zinc-400 border border-zinc-300"
                        }`}
                      >
                        {isKept && <Check className="w-3.5 h-3.5" />}
                        {isMissed && <X className="w-3.5 h-3.5" />}
                      </div>

                      <div className="min-w-0">
                        <p
                          className={`text-xs font-semibold text-zinc-900 truncate ${
                            isMissed ? "line-through text-zinc-400" : ""
                          }`}
                        >
                          {p.text}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3" />
                            {p.date} {rule.status === "today" ? "(Today)" : rule.status === "yesterday" ? "(Yesterday)" : ""}
                          </span>
                          {p.targetMinutes && (
                            <span className="font-mono text-zinc-500">
                              · {p.targetMinutes}m target
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isModifiable ? (
                        <span
                          className="px-2.5 py-1 bg-zinc-100 text-zinc-400 font-mono text-[10px] rounded-md flex items-center gap-1 cursor-not-allowed select-none"
                          title={`Locked (${rule.message})`}
                        >
                          <Lock className="w-3 h-3 text-zinc-400" />
                          Locked
                        </span>
                      ) : (
                        <>
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleKeep(p.id, p.date)}
                                disabled={isPendingAction}
                                className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs rounded-lg transition"
                              >
                                Mark Kept
                              </button>
                              <button
                                onClick={() => handleMiss(p.id, p.date)}
                                disabled={isPendingAction}
                                className="px-3 py-1 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 font-medium text-xs rounded-lg transition"
                              >
                                Missed
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleDelete(p.id, p.date)}
                            disabled={isPendingAction}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-red-500 rounded transition"
                            title="Delete commitment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

