"use client";

import React, { useState, useEffect } from "react";
import { Shield, Lock, Clock, Trash2, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { createImpulseLock, resolveImpulseLock, deleteImpulseLock } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

interface ImpulseLockItem {
  id: string;
  itemName: string;
  amount: number;
  category: string;
  urgencyRationale: string | null;
  coolsAt: Date | string;
  status: string; // 'cooling' | 'killed' | 'purchased'
  createdAt: Date | string;
  resolvedAt: Date | string | null;
}

interface ImpulseVaultProps {
  locks: ImpulseLockItem[];
  currency: string;
}

function CountdownTimer({ coolsAt }: { coolsAt: Date | string }) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isCooled: boolean;
  }>({ hours: 0, minutes: 0, seconds: 0, isCooled: false });

  useEffect(() => {
    const update = () => {
      const target = new Date(coolsAt).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isCooled: true });
      } else {
        const totalSeconds = Math.floor(diff / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        setTimeLeft({ hours, minutes, seconds, isCooled: false });
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [coolsAt]);

  if (timeLeft.isCooled) {
    return (
      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 animate-pulse">
        <Sparkles className="w-3.5 h-3.5" />
        Cooling Period Expired — Ready for Verdict
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
      <Clock className="w-3.5 h-3.5" />
      <span>
        {String(timeLeft.hours).padStart(2, "0")}h : {String(timeLeft.minutes).padStart(2, "0")}m : {String(timeLeft.seconds).padStart(2, "0")}s
      </span>
      <span className="text-[10px] text-muted font-sans ml-1">cooling</span>
    </div>
  );
}

function LockCard({
  lock,
  currency,
  onDelete,
  onResolve,
}: {
  lock: ImpulseLockItem;
  currency: string;
  onDelete: (id: string) => void;
  onResolve: (lockId: string, resolution: "killed" | "purchased", name: string, cost: number) => void;
}) {
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const checkExpired = () => {
      setIsExpired(new Date(lock.coolsAt).getTime() <= Date.now());
    };
    checkExpired();
    const interval = setInterval(checkExpired, 1000);
    return () => clearInterval(interval);
  }, [lock.coolsAt]);

  return (
    <div
      className={`p-5 rounded-xl bg-surface border transition-all flex flex-col justify-between ${
        isExpired
          ? "border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
          : "border-border hover:border-border/80"
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h5 className="text-sm font-semibold text-ivory">{lock.itemName}</h5>
            <div className="text-lg font-serif font-bold text-gold mt-1">
              {currency}{lock.amount.toFixed(2)}
            </div>
          </div>
          <button
            onClick={() => onDelete(lock.id)}
            className="text-stone/60 hover:text-rose-400 p-1 transition-colors"
            title="Delete entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {lock.urgencyRationale && (
          <p className="text-xs text-stone italic mt-2.5 bg-obsidian/50 p-2.5 rounded-lg border border-border/40">
            &quot;{lock.urgencyRationale}&quot;
          </p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border/60 space-y-3">
        <CountdownTimer coolsAt={lock.coolsAt} />

        {/* Verdict Decision Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onResolve(lock.id, "killed", lock.itemName, lock.amount)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-all group"
          >
            <CheckCircle2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            Kill Desire (Save {currency}{lock.amount.toFixed(0)})
          </button>

          <button
            onClick={() => onResolve(lock.id, "purchased", lock.itemName, lock.amount)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              isExpired
                ? "bg-elevated hover:bg-surface text-stone hover:text-ivory border border-border"
                : "bg-surface text-muted border border-border/40 opacity-70 hover:opacity-100"
            }`}
            title={isExpired ? "Execute purchase & log expense" : "Purchase prematurely"}
          >
            <XCircle className="w-3.5 h-3.5" />
            {isExpired ? "Approve Purchase" : "Override Lock"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ImpulseVault({ locks, currency }: ImpulseVaultProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [itemName, setItemName] = useState("");
  const [amount, setAmount] = useState("");
  const [urgencyRationale, setUrgencyRationale] = useState("");
  const [hoursDelay, setHoursDelay] = useState(48);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const activeLocks = locks.filter((l) => l.status === "cooling");
  const killedLocks = locks.filter((l) => l.status === "killed");

  const totalSaved = killedLocks.reduce((sum, l) => sum + l.amount, 0);

  const handleCreateLock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !amount) return;

    setIsSubmitting(true);
    try {
      await createImpulseLock({
        itemName,
        amount: parseFloat(amount),
        urgencyRationale,
        hoursDelay,
      });
      setItemName("");
      setAmount("");
      setUrgencyRationale("");
      setHoursDelay(48);
      setShowAddModal(false);
      setFeedbackMessage("Temptation locked in vault! The 48-hour cooling shield is active.");
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async (lockId: string, resolution: "killed" | "purchased", name: string, cost: number) => {
    try {
      await resolveImpulseLock(lockId, resolution);
      if (resolution === "killed") {
        setFeedbackMessage(`Victory! You resisted '${name}' and preserved ${currency}${cost.toFixed(2)}.`);
      } else {
        setFeedbackMessage(`'${name}' approved and converted to expense transaction.`);
      }
      setTimeout(() => setFeedbackMessage(null), 6000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (lockId: string) => {
    if (!confirm("Remove this entry from the vault?")) return;
    try {
      await deleteImpulseLock(lockId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner / Header */}
      <div className="p-6 rounded-xl bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-serif font-semibold text-ivory tracking-wide">
              The Impulse Purchase Shield
            </h3>
          </div>
          <p className="text-xs text-stone mt-1 max-w-xl leading-relaxed">
            Neurological dopamine peaks when you see something you want to buy. Lock every non-essential purchase in the vault for 48 hours. If the desire fades, your capital stays intact.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gold text-obsidian text-xs font-semibold rounded-lg hover:bg-gold/90 transition-colors shadow-sm self-start md:self-auto"
        >
          <Lock className="w-4 h-4" />
          Lock a Temptation
        </button>
      </div>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Lock Temptation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-surface border border-border rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="text-sm font-serif font-bold text-ivory flex items-center gap-2">
                <Lock className="w-4 h-4 text-gold" />
                Deposit Temptation into Shield Vault
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone hover:text-ivory text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLock} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
                  Item / Temptation Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-border rounded-lg text-ivory text-sm focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
                  Estimated Cost ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="249.99"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-border rounded-lg text-ivory text-sm focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
                  Why do you feel the urgent urge to buy this right now?
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Saw it on social media, thought it would improve focus..."
                  value={urgencyRationale}
                  onChange={(e) => setUrgencyRationale(e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-border rounded-lg text-ivory text-sm focus:outline-none focus:border-gold resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
                  Cooling Period Lock Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[24, 48, 72].map((hrs) => (
                    <button
                      type="button"
                      key={hrs}
                      onClick={() => setHoursDelay(hrs)}
                      className={`py-1.5 text-xs font-medium rounded-md border transition-all ${
                        hoursDelay === hrs
                          ? "bg-gold text-obsidian border-gold font-semibold"
                          : "bg-elevated text-stone border-border hover:text-ivory"
                      }`}
                    >
                      {hrs} Hours
                    </button>
                  ))}
                </div>
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
                  {isSubmitting ? "Locking..." : "Activate Shield"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Cooling Vault Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs uppercase tracking-widest text-muted font-semibold flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            Under Lockdown ({activeLocks.length})
          </h4>
          <span className="text-[11px] text-stone">
            Decision unlocked once countdown reaches zero
          </span>
        </div>

        {activeLocks.length === 0 ? (
          <EmptyState
            title="Vault is currently empty"
            description="Before swiping your card on any discretionary luxury or tech gadget, lock it here for a 48-hour cooling period to defeat emotional buying."
            icon={Shield}
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddModal(true)}
              >
                <Lock className="w-4 h-4 mr-1.5 inline" />
                Lock a Temptation
              </Button>
            }
            tip="Pro-tip: 82% of locked impulse purchases are voluntarily cancelled once dopamine normalizes after 48 hours."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLocks.map((lock) => (
              <LockCard
                key={lock.id}
                lock={lock}
                currency={currency}
                onDelete={handleDelete}
                onResolve={handleResolve}
              />
            ))}
          </div>
        )}
      </div>

      {/* Hall of Resisted Temptations */}
      {killedLocks.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <h4 className="text-xs uppercase tracking-widest text-emerald-400 font-semibold flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              Hall of Resisted Temptations ({killedLocks.length})
            </h4>
            <span className="text-xs font-medium text-emerald-400">
              Total Capital Preserved: {currency}{totalSaved.toLocaleString()}
            </span>
          </div>

          <div className="divide-y divide-border/50 rounded-xl bg-surface border border-border overflow-hidden">
            {killedLocks.map((lock) => (
              <div key={lock.id} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ivory truncate">{lock.itemName}</div>
                  <div className="text-[11px] text-muted flex items-center gap-2 mt-0.5">
                    <span>Saved {new Date(lock.resolvedAt || lock.createdAt).toLocaleDateString()}</span>
                    {lock.urgencyRationale && (
                      <span className="italic truncate max-w-xs text-stone">· &quot;{lock.urgencyRationale}&quot;</span>
                    )}
                  </div>
                </div>

                <div className="text-sm font-serif font-bold text-emerald-400 shrink-0">
                  +{currency}{lock.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
