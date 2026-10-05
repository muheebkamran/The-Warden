"use client";

import React, { useState } from "react";
import {
  Wallet,
  ArrowUpRight,
  Receipt,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  PieChart as PieIcon,
  DollarSign,
  TrendingUp,
  Camera,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { BillPhotoUpload } from "./BillPhotoUpload";
import { SpendingTrendChart } from "./SpendingTrendChart";
import { addTransaction, deleteTransaction, toggleBillPaid, deleteBill } from "@/app/actions";

interface Transaction {
  id: string;
  amount: number;
  category: string;
  type: string; // 'income' | 'expense'
  date: string;
  description: string;
}

interface Bill {
  id: string;
  billName: string;
  amount: number;
  date: string;
  photoUrl?: string | null;
  paid: boolean;
}

interface FinanceDashboardProps {
  initialProfile: {
    monthlyBudget: number;
    currency: string;
  } | null;
  transactions: Transaction[];
  bills: Bill[];
}

const CATEGORY_COLORS: { [key: string]: string } = {
  Bills: "#f59e0b", // Amber
  Food: "#10b981", // Emerald
  Transit: "#3b82f6", // Blue
  Rent: "#8b5cf6", // Purple
  Entertainment: "#ec4899", // Pink
  Shopping: "#f97316", // Orange
  Other: "#64748b", // Slate
};

export function FinanceDashboard({
  initialProfile,
  transactions,
  bills,
}: FinanceDashboardProps) {
  const currency = initialProfile?.currency || "$";

  // Month navigation state
  const currentDate = new Date();
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth()); // 0-indexed

  // UI state
  const [showBillUpload, setShowBillUpload] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeDesc, setIncomeDesc] = useState("Monthly Salary / Capital In");

  // Daily expense state
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Food");
  const [expenseDesc, setExpenseDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Month prefix string: YYYY-MM
  const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
  const monthLabel = new Date(currentYear, currentMonth, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Filter items by selected month
  const monthTransactions = transactions.filter((t) => t.date.startsWith(monthKey));
  const monthBills = bills.filter((b) => b.date.startsWith(monthKey));

  // Calculations
  const totalIncome = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDailyExpenses = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBills = monthBills.reduce((sum, b) => sum + b.amount, 0);
  const totalOutflows = totalDailyExpenses + totalBills;
  const netSavings = totalIncome - totalOutflows;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;

  // Donut Chart data aggregation
  const categoryTotals: { [name: string]: number } = {};
  if (totalBills > 0) {
    categoryTotals["Bills"] = totalBills;
  }
  monthTransactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const cat = t.category.charAt(0).toUpperCase() + t.category.slice(1).toLowerCase();
      categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
    });

  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value: Math.round(value * 100) / 100,
  }));

  // Handlers
  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incomeAmount) return;
    setIsSubmitting(true);
    try {
      const todayStr = `${monthKey}-01`;
      await addTransaction({
        amount: parseFloat(incomeAmount),
        category: "income",
        type: "income",
        date: todayStr,
        description: incomeDesc.trim() || "Income Deposit",
      });
      setIncomeAmount("");
      setShowIncomeModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || !expenseDesc) return;
    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const targetDate = today.startsWith(monthKey) ? today : `${monthKey}-15`;

      await addTransaction({
        amount: parseFloat(expenseAmount),
        category: expenseCategory.toLowerCase(),
        type: "expense",
        date: targetDate,
        description: expenseDesc.trim(),
      });
      setExpenseAmount("");
      setExpenseDesc("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
      {/* 1. Header & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-gold">
            MONEY & BILLS
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-ivory tracking-wide mt-1">
            Money & Bills
          </h1>
        </div>

        {/* Month Selector Carousel */}
        <div className="flex items-center gap-3 bg-surface px-4 py-2 rounded-xl border border-border shadow-xs self-start sm:self-auto">
          <button
            onClick={prevMonth}
            className="p-1 rounded text-stone hover:text-ivory transition-colors cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-serif font-semibold text-ivory min-w-[120px] text-center">
            {monthLabel}
          </span>
          <button
            onClick={nextMonth}
            className="p-1 rounded text-stone hover:text-ivory transition-colors cursor-pointer"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. End-of-Month Summary Cards (Top Overview) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income Card */}
        <div className="p-5 rounded-xl bg-surface border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-muted font-medium">Money In</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-serif font-bold text-emerald-400">
              {currency}{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-stone mt-1">Total earnings and deposits</p>
          </div>
          <button
            onClick={() => setShowIncomeModal(true)}
            className="text-[11px] text-gold hover:underline font-medium flex items-center gap-1 self-start cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Add Income
          </button>
        </div>

        {/* Bills Card */}
        <div className="p-5 rounded-xl bg-surface border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-muted font-medium">Bills</span>
            <Receipt className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-serif font-bold text-amber-400">
              {currency}{totalBills.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-stone mt-1">
              {monthBills.filter((b) => b.paid).length} of {monthBills.length} bills paid
            </p>
          </div>
          <button
            onClick={() => setShowBillUpload(true)}
            className="text-[11px] text-gold hover:underline font-medium flex items-center gap-1 self-start cursor-pointer"
          >
            <Camera className="w-3 h-3" /> Add or Scan Bill
          </button>
        </div>

        {/* Daily Expenses Card */}
        <div className="p-5 rounded-xl bg-surface border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-muted font-medium">Daily Spending</span>
            <DollarSign className="w-4 h-4 text-rose-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-serif font-bold text-ivory">
              {currency}{totalDailyExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-stone mt-1">
              Everyday purchases this month
            </p>
          </div>
          <span className="text-[11px] text-muted font-mono">
            Total Spent: {currency}{totalOutflows.toFixed(0)}
          </span>
        </div>

        {/* Net Savings & Savings Rate */}
        <div className="p-5 rounded-xl bg-surface border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-muted font-medium">Total Saved</span>
            <TrendingUp className={`w-4 h-4 ${netSavings >= 0 ? "text-emerald-400" : "text-rose-400"}`} />
          </div>
          <div className="my-2">
            <div className={`text-2xl font-serif font-bold ${netSavings >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {netSavings >= 0 ? "+" : ""}{currency}{netSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-stone mt-1">
              Savings Rate: <span className="text-ivory font-semibold">{savingsRate}%</span>
            </p>
          </div>
          <div className="w-full bg-elevated rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Income Modal */}
      {showIncomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-surface border border-border rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="text-sm font-serif font-bold text-ivory flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                Deposit / Record Income
              </h4>
              <button onClick={() => setShowIncomeModal(false)} className="text-stone hover:text-ivory text-sm">
                ✕
              </button>
            </div>
            <form onSubmit={handleAddIncome} className="space-y-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
                  Amount ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="3500.00"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-border rounded-lg text-ivory text-sm focus:outline-none focus:border-gold"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
                  Source / Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="Monthly Salary, Consulting, etc."
                  value={incomeDesc}
                  onChange={(e) => setIncomeDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-border rounded-lg text-ivory text-sm focus:outline-none focus:border-gold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIncomeModal(false)}
                  className="px-3 py-1.5 text-xs text-stone hover:text-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-emerald-500 text-obsidian text-xs font-semibold rounded-lg hover:bg-emerald-400 transition-colors"
                >
                  Record Income
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bill OCR Upload Drawer / Modal */}
      {showBillUpload && (
        <div className="animate-in fade-in slide-in-from-top-2">
          <BillPhotoUpload
            currency={currency}
            onBillAdded={() => setShowBillUpload(false)}
            onCancel={() => setShowBillUpload(false)}
          />
        </div>
      )}

      {/* 3. Bills Section & Donut Chart Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bills Ledger (2 columns) */}
        <div className="lg:col-span-2 rounded-xl bg-surface border border-border p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/80">
            <div>
              <h3 className="text-sm font-serif font-bold text-ivory flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-400" />
                Monthly Bills
              </h3>
              <p className="text-[11px] text-stone mt-0.5">
                Add recurring bills or scan receipts with your camera
              </p>
            </div>
            <button
              onClick={() => setShowBillUpload(!showBillUpload)}
              className="flex items-center gap-1 px-3 py-1.5 bg-elevated hover:bg-surface border border-border rounded-lg text-xs font-medium text-stone hover:text-ivory transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-gold" />
              <span>{showBillUpload ? "Close Scanner" : "Add / Scan Bill"}</span>
            </button>
          </div>

          {monthBills.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone space-y-2">
              <Receipt className="w-8 h-8 text-stone/40 mx-auto" />
              <p>No bills recorded for {monthLabel}.</p>
              <button
                onClick={() => setShowBillUpload(true)}
                className="text-gold underline text-[11px]"
              >
                Scan your first bill photo with Claude OCR
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {monthBills.map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleBillPaid(b.id)}
                      className="p-1 text-stone hover:text-emerald-400 transition-colors"
                      title={b.paid ? "Mark unpaid" : "Mark paid"}
                    >
                      {b.paid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-stone" />
                      )}
                    </button>
                    <div>
                      <div className={`text-xs font-medium ${b.paid ? "line-through text-stone" : "text-ivory"}`}>
                        {b.billName}
                      </div>
                      <div className="text-[10px] text-muted flex items-center gap-2">
                        <span>Due {b.date}</span>
                        {b.photoUrl && (
                          <a
                            href={b.photoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-gold hover:underline"
                          >
                            View Receipt
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-serif font-bold ${b.paid ? "text-stone" : "text-amber-400"}`}>
                      {currency}{b.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => deleteBill(b.id)}
                      className="p-1 text-stone/40 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expense Donut Chart (1 column) */}
        <div className="rounded-xl bg-surface border border-border p-5 flex flex-col justify-between">
          <div className="pb-2 border-b border-border/80">
            <h3 className="text-sm font-serif font-bold text-ivory flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-gold" />
              Spending by Category
            </h3>
            <p className="text-[11px] text-stone mt-0.5">Where your money went this month</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center my-2">
            {chartData.length === 0 ? (
              <p className="text-xs text-stone italic">No outflow data for {monthLabel}</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[entry.name] || "#64748b"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${currency}${value}`, "Amount"]}
                    contentStyle={{
                      backgroundColor: "var(--color-surface, #141417)",
                      borderColor: "var(--color-border, #27272a)",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: "#fff",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "10px", color: "var(--color-stone, #a1a1aa)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="text-[11px] text-stone text-center border-t border-border/60 pt-2">
            Total Out: <span className="text-ivory font-semibold">{currency}{totalOutflows.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 4. Spending Flow & Cumulative Burn Velocity (Line + Area Combo) */}
      <SpendingTrendChart
        transactions={monthTransactions}
        bills={monthBills}
        currency={currency}
        monthKey={monthKey}
        monthLabel={monthLabel}
      />

      {/* 5. Daily Variable Expenses Section */}
      <div className="rounded-xl bg-surface border border-border p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
          <div>
            <h3 className="text-sm font-serif font-bold text-ivory flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gold" />
              Daily Spending
            </h3>
            <p className="text-[11px] text-stone mt-0.5">
              Quickly record everyday spending
            </p>
          </div>
        </div>

        {/* Quick Add Inline Bar */}
        <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder={`Amount (${currency})`}
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
            className="px-3 py-1.5 bg-obsidian border border-border rounded-lg text-ivory text-xs focus:outline-none focus:border-gold"
          />
          <select
            value={expenseCategory}
            onChange={(e) => setExpenseCategory(e.target.value)}
            className="px-3 py-1.5 bg-obsidian border border-border rounded-lg text-ivory text-xs focus:outline-none focus:border-gold"
          >
            <option value="Food">Food & Groceries</option>
            <option value="Transit">Transit & Fuel</option>
            <option value="Shopping">Shopping & Discretionary</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Rent">Rent & Housing</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="text"
            required
            placeholder="Description (e.g. Lunch with team)"
            value={expenseDesc}
            onChange={(e) => setExpenseDesc(e.target.value)}
            className="px-3 py-1.5 bg-obsidian border border-border rounded-lg text-ivory text-xs focus:outline-none focus:border-gold"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-1.5 bg-gold text-obsidian text-xs font-semibold rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Adding..." : "Add Expense"}
          </button>
        </form>

        {/* Expense List */}
        <div className="space-y-2 pt-2">
          {monthTransactions.filter((t) => t.type === "expense").length === 0 ? (
            <p className="text-xs text-stone italic text-center py-4">No daily expenses logged for {monthLabel}.</p>
          ) : (
            <div className="divide-y divide-border/40">
              {monthTransactions
                .filter((t) => t.type === "expense")
                .map((tx) => (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-elevated border border-border/60 text-stone">
                        {tx.category}
                      </span>
                      <span className="text-ivory font-medium">{tx.description}</span>
                      <span className="text-muted text-[10px]">{tx.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-serif font-bold text-ivory">
                        -{currency}{tx.amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-1 text-stone/40 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
