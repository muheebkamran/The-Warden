"use client";

import React, { useState } from "react";
import { Wallet, Shield, Receipt, Target, LayoutDashboard } from "lucide-react";
import { FinanceOverview } from "./FinanceOverview";
import { ImpulseVault } from "./ImpulseVault";
import { ExpenseLedger } from "./ExpenseLedger";
import { FortressGoals } from "./FortressGoals";

interface FinanceDashboardProps {
  initialProfile: {
    monthlyBudget: number;
    currency: string;
  } | null;
  transactions: any[];
  impulseLocks: any[];
  financialGoals: any[];
}

export function FinanceDashboard({
  initialProfile,
  transactions,
  impulseLocks,
  financialGoals,
}: FinanceDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "vault" | "ledger" | "goals">("overview");

  const monthlyBudget = initialProfile?.monthlyBudget ?? 2000;
  const currency = initialProfile?.currency ?? "$";

  // Calculations
  const todayStr = new Date().toISOString().split("T")[0];
  const currentMonthPrefix = todayStr.substring(0, 7); // YYYY-MM

  const todaySpent = transactions
    .filter((t) => t.date === todayStr && t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthSpent = transactions
    .filter((t) => t.date.startsWith(currentMonthPrefix) && t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const killedLocks = impulseLocks.filter((l) => l.status === "killed");
  const totalSavedFromImpulse = killedLocks.reduce((sum, l) => sum + l.amount, 0);
  const resistedImpulsesCount = killedLocks.length;

  const fortressTotalSaved = financialGoals.reduce((sum, g) => sum + g.currentAmount, 0);

  const tabs = [
    { id: "overview", label: "Command Center", icon: LayoutDashboard },
    { id: "vault", label: "Impulse Vault", icon: Shield, badge: impulseLocks.filter((l) => l.status === "cooling").length },
    { id: "ledger", label: "Expense Ledger", icon: Receipt },
    { id: "goals", label: "Fortress Goals", icon: Target },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Chamber Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-gold">
              Financial Discipline Chamber
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-ivory tracking-wide mt-1">
            Capital Sovereignty
          </h1>
          <p className="text-xs text-stone mt-1.5 max-w-xl">
            Rule your capital. Every dollar spent without purpose is discipline surrendered; every impulse rejected builds your sovereign fortress.
          </p>
        </div>

        {/* Chamber Tab Navigation */}
        <div className="flex items-center gap-1.5 bg-surface p-1 rounded-xl border border-border overflow-x-auto scrollbar-none self-start md:self-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-elevated text-ivory shadow-sm border border-border/80"
                    : "text-stone hover:text-ivory hover:bg-elevated/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-gold" : "text-stone"}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <FinanceOverview
            monthlyBudget={monthlyBudget}
            currency={currency}
            todaySpent={todaySpent}
            monthSpent={monthSpent}
            totalSavedFromImpulse={totalSavedFromImpulse}
            resistedImpulsesCount={resistedImpulsesCount}
            fortressTotalSaved={fortressTotalSaved}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ImpulseVault locks={impulseLocks} currency={currency} />
            <ExpenseLedger transactions={transactions} currency={currency} />
          </div>
        </div>
      )}

      {activeTab === "vault" && (
        <div className="animate-in fade-in duration-200">
          <ImpulseVault locks={impulseLocks} currency={currency} />
        </div>
      )}

      {activeTab === "ledger" && (
        <div className="animate-in fade-in duration-200">
          <ExpenseLedger transactions={transactions} currency={currency} />
        </div>
      )}

      {activeTab === "goals" && (
        <div className="animate-in fade-in duration-200">
          <FortressGoals goals={financialGoals} currency={currency} />
        </div>
      )}
    </div>
  );
}
