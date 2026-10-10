"use client";

import React, { useState } from "react";
import { ShieldCheck, TrendingDown, DollarSign, Wallet, Settings2, Check } from "lucide-react";
import { updateFinanceBudget } from "@/app/actions";

interface FinanceOverviewProps {
  monthlyBudget: number;
  currency: string;
  todaySpent: number;
  monthSpent: number;
  totalSavedFromImpulse: number;
  resistedImpulsesCount: number;
  fortressTotalSaved: number;
}

export function FinanceOverview({
  monthlyBudget,
  currency,
  todaySpent,
  monthSpent,
  totalSavedFromImpulse,
  resistedImpulsesCount,
  fortressTotalSaved,
}: FinanceOverviewProps) {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());
  const [currencyInput, setCurrencyInput] = useState(currency);
  const [isSaving, setIsSaving] = useState(false);

  // Daily Allowance = monthlyBudget / 30
  const dailyAllowance = monthlyBudget > 0 ? monthlyBudget / 30 : 0;
  const isDailyDisciplined = todaySpent <= dailyAllowance;
  const dailyDiff = Math.abs(dailyAllowance - todaySpent);

  // Monthly Burn calculation
  const monthlyPercent = monthlyBudget > 0 ? Math.min(100, Math.round((monthSpent / monthlyBudget) * 100)) : 0;
  const monthlyExceeded = monthSpent > monthlyBudget;

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const val = parseFloat(budgetInput);
      if (!isNaN(val) && val >= 0) {
        await updateFinanceBudget(val, currencyInput);
        setIsEditingBudget(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Config */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-surface border border-border">
        <div>
          <h2 className="text-lg font-serif tracking-wide text-ivory flex items-center gap-2">
            <Wallet className="w-5 h-5 text-gold" />
            Financial Fortress Overview
          </h2>
          <p className="text-xs text-stone mt-1">
            Standard: <span className="text-ivory font-medium">{currency}{monthlyBudget.toLocaleString()}</span> / month · Daily Allowance: <span className="text-gold font-medium">{currency}{dailyAllowance.toFixed(0)}</span>
          </p>
        </div>

        <button
          onClick={() => {
            setBudgetInput(monthlyBudget.toString());
            setCurrencyInput(currency);
            setIsEditingBudget(!isEditingBudget);
          }}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-stone hover:text-ivory bg-elevated hover:bg-surface border border-border rounded-lg transition-colors"
        >
          <Settings2 className="w-3.5 h-3.5" />
          {isEditingBudget ? "Cancel" : "Configure Budget"}
        </button>
      </div>

      {/* Edit Budget Form */}
      {isEditingBudget && (
        <form onSubmit={handleSaveBudget} className="p-4 rounded-xl bg-elevated border border-border/80 flex flex-wrap items-end gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">Currency Symbol</label>
            <input
              type="text"
              value={currencyInput}
              onChange={(e) => setCurrencyInput(e.target.value)}
              className="w-20 px-3 py-1.5 bg-obsidian border border-border rounded-md text-ivory text-sm focus:outline-none focus:border-gold"
              placeholder="$"
              maxLength={4}
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">Monthly Budget Target</label>
            <input
              type="number"
              step="10"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="w-44 px-3 py-1.5 bg-obsidian border border-border rounded-md text-ivory text-sm focus:outline-none focus:border-gold"
              placeholder="2000"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gold text-obsidian text-sm font-semibold rounded-md hover:bg-gold/90 transition-colors disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Target"}
          </button>
        </form>
      )}

      {/* 4 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Burn vs Daily Allowance */}
        <div className="p-5 rounded-xl bg-surface border border-border flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] uppercase tracking-widest text-muted font-medium">Daily Burn Rate</span>
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                isDailyDisciplined
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/30"
              }`}
            >
              {isDailyDisciplined ? "Disciplined" : "Breach"}
            </span>
          </div>

          <div className="my-3">
            <div className="text-2xl font-serif font-bold text-ivory">
              {currency}{todaySpent.toFixed(2)}
            </div>
            <div className="text-xs text-stone mt-1">
              Allowance: {currency}{dailyAllowance.toFixed(2)}
            </div>
          </div>

          <div className="text-[11px] text-muted flex items-center gap-1">
            {isDailyDisciplined ? (
              <span className="text-emerald-400 font-medium">+{currency}{dailyDiff.toFixed(2)} cushion remaining</span>
            ) : (
              <span className="text-rose-400 font-medium">-{currency}{dailyDiff.toFixed(2)} over limit</span>
            )}
          </div>
        </div>

        {/* Card 2: Monthly Burn Velocity */}
        <div className="p-5 rounded-xl bg-surface border border-border flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] uppercase tracking-widest text-muted font-medium">Monthly Burn Velocity</span>
            <TrendingDown className="w-4 h-4 text-stone" />
          </div>

          <div className="my-3">
            <div className="text-2xl font-serif font-bold text-ivory">
              {currency}{monthSpent.toLocaleString()}
            </div>
            <div className="text-xs text-stone mt-1">
              of {currency}{monthlyBudget.toLocaleString()} limit ({monthlyPercent}%)
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-elevated rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                monthlyExceeded
                  ? "bg-rose-500"
                  : monthlyPercent > 80
                  ? "bg-amber-400"
                  : "bg-emerald-400"
              }`}
              style={{ width: `${Math.min(100, monthlyPercent)}%` }}
            />
          </div>
        </div>

        {/* Card 3: Impulse Shield Preserved */}
        <div className="p-5 rounded-xl bg-surface border border-border flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] uppercase tracking-widest text-muted font-medium">Impulse Shield Saved</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="my-3">
            <div className="text-2xl font-serif font-bold text-emerald-400">
              {currency}{totalSavedFromImpulse.toLocaleString()}
            </div>
            <div className="text-xs text-stone mt-1">
              Preserved by deliberate delay
            </div>
          </div>

          <div className="text-[11px] text-stone">
            <span className="text-ivory font-medium">{resistedImpulsesCount}</span> temptations killed in vault
          </div>
        </div>

        {/* Card 4: Fortress Goals Capital */}
        <div className="p-5 rounded-xl bg-surface border border-border flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] uppercase tracking-widest text-muted font-medium">Fortress Capital</span>
            <DollarSign className="w-4 h-4 text-gold" />
          </div>

          <div className="my-3">
            <div className="text-2xl font-serif font-bold text-gold">
              {currency}{fortressTotalSaved.toLocaleString()}
            </div>
            <div className="text-xs text-stone mt-1">
              Active savings & defense funds
            </div>
          </div>

          <div className="text-[11px] text-muted">
            Capital allocated to peace of mind
          </div>
        </div>
      </div>
    </div>
  );
}
