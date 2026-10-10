"use client";

import React, { useState } from "react";
import {
  ArrowUpRight,
  Receipt,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  PieChart as PieIcon,
  DollarSign,
  TrendingUp,
  Camera,
  Calendar,
  Pencil,
  X,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { BillPhotoUpload } from "./BillPhotoUpload";
import { SpendingTrendChart } from "./SpendingTrendChart";
import { FinanceOverview } from "./FinanceOverview";
import { ExpenseLedger } from "./ExpenseLedger";
import { FortressGoals } from "./FortressGoals";
import { ImpulseVault } from "./ImpulseVault";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  addTransaction,
  deleteTransaction,
  updateTransaction,
  toggleBillPaid,
  deleteBill,
  updateBill,
} from "@/app/actions";

interface Transaction {
  id: string;
  amount: number;
  category: string;
  type: string; // 'income' | 'expense'
  date: string;
  description: string;
  createdAt?: Date | string;
}

interface Bill {
  id: string;
  billName: string;
  amount: number;
  date: string;
  photoUrl?: string | null;
  paid: boolean;
}

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

interface ImpulseLockItem {
  id: string;
  itemName: string;
  amount: number;
  category: string;
  urgencyRationale: string | null;
  coolsAt: Date | string;
  status: string;
  createdAt: Date | string;
  resolvedAt: Date | string | null;
}

interface FinanceDashboardProps {
  initialProfile: {
    monthlyBudget: number;
    currency: string;
  } | null;
  transactions: Transaction[];
  bills: Bill[];
  goals?: FinancialGoalItem[];
  locks?: ImpulseLockItem[];
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
  goals = [],
  locks = [],
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

  // Edit Bill state
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [editBillName, setEditBillName] = useState("");
  const [editBillAmount, setEditBillAmount] = useState("");
  const [editBillDate, setEditBillDate] = useState("");
  const [editBillPaid, setEditBillPaid] = useState(false);
  const [isUpdatingBill, setIsUpdatingBill] = useState(false);
  const [editBillError, setEditBillError] = useState<string | null>(null);

  const openEditBill = (b: Bill) => {
    setEditingBill(b);
    setEditBillName(b.billName);
    setEditBillAmount(b.amount.toString());
    setEditBillDate(b.date);
    setEditBillPaid(b.paid);
    setEditBillError(null);
  };

  const handleUpdateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBill || !editBillName || !editBillAmount || !editBillDate) return;

    setIsUpdatingBill(true);
    setEditBillError(null);
    try {
      await updateBill({
        id: editingBill.id,
        billName: editBillName.trim(),
        amount: parseFloat(editBillAmount),
        date: editBillDate,
        photoUrl: editingBill.photoUrl,
        paid: editBillPaid,
      });
      setEditingBill(null);
    } catch (err: unknown) {
      console.error(err);
      setEditBillError(err instanceof Error ? err.message : "Failed to update bill");
    } finally {
      setIsUpdatingBill(false);
    }
  };

  // Edit Transaction state
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editTxDesc, setEditTxDesc] = useState("");
  const [editTxAmount, setEditTxAmount] = useState("");
  const [editTxCategory, setEditTxCategory] = useState("Food");
  const [editTxDate, setEditTxDate] = useState("");
  const [editTxType, setEditTxType] = useState<"expense" | "income">("expense");
  const [isUpdatingTx, setIsUpdatingTx] = useState(false);
  const [editTxError, setEditTxError] = useState<string | null>(null);

  const openEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setEditTxDesc(tx.description);
    setEditTxAmount(tx.amount.toString());
    setEditTxCategory(tx.category.charAt(0).toUpperCase() + tx.category.slice(1).toLowerCase());
    setEditTxDate(tx.date);
    setEditTxType(tx.type === "income" ? "income" : "expense");
    setEditTxError(null);
  };

  const handleUpdateTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx || !editTxDesc || !editTxAmount || !editTxDate) return;

    setIsUpdatingTx(true);
    setEditTxError(null);
    try {
      await updateTransaction({
        id: editingTx.id,
        description: editTxDesc.trim(),
        amount: parseFloat(editTxAmount),
        category: editTxCategory.toLowerCase(),
        date: editTxDate,
        type: editTxType,
      });
      setEditingTx(null);
    } catch (err: unknown) {
      console.error(err);
      setEditTxError(err instanceof Error ? err.message : "Failed to update transaction");
    } finally {
      setIsUpdatingTx(false);
    }
  };

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

  // Overview metrics
  const todayStr = new Date().toISOString().split("T")[0];
  const todaySpent = transactions
    .filter((t) => t.date === todayStr && t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSavedFromImpulse = locks
    .filter((l) => l.status === "killed")
    .reduce((sum, l) => sum + l.amount, 0);

  const resistedImpulsesCount = locks.filter((l) => l.status === "killed").length;

  const fortressTotalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

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
      {/* 1. Header & Month Selector (Stitch Architecture) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#222227]">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1C1C20] border border-[#2E2E35] font-mono text-[10px] text-[#FFFC00] font-bold tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFFC00] animate-pulse" />
              MONEY &amp; BILLS
            </span>
            <span className="font-mono text-[11px] text-zinc-500 font-semibold tracking-wider uppercase">
              FINANCIAL TELEMETRY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Money &amp; Bills
          </h1>
          {/* Month Selector */}
          <div className="flex items-center gap-2 mt-0.5">
            <button
              onClick={prevMonth}
              className="p-1 text-zinc-400 hover:text-white rounded-md hover:bg-[#1C1C20] transition-colors cursor-pointer"
              title="Previous Month"
              type="button"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#141416] border border-[#26262B] text-white font-mono text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-[#FFFC00]" />
              <span>{monthLabel}</span>
            </div>
            <button
              onClick={nextMonth}
              className="p-1 text-zinc-400 hover:text-white rounded-md hover:bg-[#1C1C20] transition-colors cursor-pointer"
              title="Next Month"
              type="button"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowIncomeModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1C1C20] hover:bg-[#24242C] border border-[#2E2E35] text-white font-bold text-xs sm:text-sm active:scale-95 transition-all cursor-pointer"
            type="button"
          >
            <Plus className="w-4 h-4 text-[#00D664]" />
            <span>+ Add Income</span>
          </button>
          <button
            onClick={() => setShowBillUpload(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFFC00] text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-[#FFFC00]/20 hover:shadow-[0_0_20px_rgba(255,252,0,0.35)] active:scale-95 transition-all cursor-pointer"
            type="button"
          >
            <Camera className="w-4 h-4 font-black" />
            <span>+ Add or Scan Bill</span>
          </button>
        </div>
      </div>

      {/* Financial Fortress Overview */}
      <FinanceOverview
        monthlyBudget={initialProfile?.monthlyBudget ?? 2000}
        currency={currency}
        todaySpent={todaySpent}
        monthSpent={totalOutflows}
        totalSavedFromImpulse={totalSavedFromImpulse}
        resistedImpulsesCount={resistedImpulsesCount}
        fortressTotalSaved={fortressTotalSaved}
      />

      {/* 2. 4 Metric KPI Cards Grid (Stitch Architecture) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Money In */}
        <div className="relative overflow-hidden rounded-2xl bg-[#141416] border border-[#26262B] p-5 flex flex-col justify-between gap-4 group hover:border-[#32323A] transition-all">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                Cash Inflow
              </span>
              <span className="text-sm font-bold text-white">Money In</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#1C1C20] border border-[#2E2E35] flex items-center justify-center text-[#00D664]">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-2xl sm:text-3xl text-white font-extrabold tracking-tight">
              {currency}{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="font-mono text-xs text-zinc-400">Total earnings and deposits</span>
          </div>
          <div className="pt-2 border-t border-[#202024]">
            <button
              onClick={() => setShowIncomeModal(true)}
              className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#FFFC00] hover:underline cursor-pointer"
              type="button"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Income</span>
            </button>
          </div>
        </div>

        {/* Card 2: Bills */}
        <div className="relative overflow-hidden rounded-2xl bg-[#141416] border border-[#26262B] p-5 flex flex-col justify-between gap-4 group hover:border-[#32323A] transition-all">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                Recurring &amp; Due
              </span>
              <span className="text-sm font-bold text-white">Bills</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#1C1C20] border border-[#2E2E35] flex items-center justify-center text-[#FFFC00]">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-2xl sm:text-3xl text-white font-extrabold tracking-tight">
              {currency}{totalBills.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="font-mono text-xs text-zinc-400">
              {monthBills.filter((b) => b.paid).length} of {monthBills.length} bills paid
            </span>
          </div>
          <div className="pt-2 border-t border-[#202024]">
            <button
              onClick={() => setShowBillUpload(true)}
              className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#FFFC00] hover:underline cursor-pointer"
              type="button"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Add or Scan Bill</span>
            </button>
          </div>
        </div>

        {/* Card 3: Daily Spending */}
        <div className="relative overflow-hidden rounded-2xl bg-[#141416] border border-[#26262B] p-5 flex flex-col justify-between gap-4 group hover:border-[#32323A] transition-all">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                Discretionary Outflow
              </span>
              <span className="text-sm font-bold text-white">Daily Spending</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#1C1C20] border border-[#2E2E35] flex items-center justify-center text-zinc-300">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-2xl sm:text-3xl text-white font-extrabold tracking-tight">
              {currency}{totalDailyExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="font-mono text-xs text-zinc-400">Everyday purchases this month</span>
          </div>
          <div className="pt-2 border-t border-[#202024] flex items-center justify-between font-mono text-xs">
            <span className="text-zinc-500">Total Spent:</span>
            <span className="text-white font-bold">{currency}{totalOutflows.toFixed(0)}</span>
          </div>
        </div>

        {/* Card 4: Total Saved */}
        <div className="relative overflow-hidden rounded-2xl bg-[#141416] border border-[#26262B] p-5 flex flex-col justify-between gap-4 group hover:border-[#32323A] transition-all">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                Net Surplus
              </span>
              <span className="text-sm font-bold text-white">Total Saved</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#00D664]/10 border border-[#00D664]/30 flex items-center justify-center text-[#00D664]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className={`font-mono text-2xl sm:text-3xl font-extrabold tracking-tight ${netSavings >= 0 ? "text-[#00D664]" : "text-[#FF2D55]"}`}>
              {netSavings >= 0 ? "+" : ""}{currency}{netSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="font-mono text-xs text-zinc-400">
              Savings Rate: <span className="text-[#00D664] font-bold">{savingsRate}%</span>
            </span>
          </div>
          <div className="pt-2 border-t border-[#202024] flex items-center justify-between font-mono text-xs">
            <span className="text-zinc-500">Efficiency:</span>
            <span className="text-[#00D664] font-bold">100% Defense</span>
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
            <EmptyState
              icon={Receipt}
              title={`No Bills Recorded for ${monthLabel}`}
              description="Keep recurring commitments transparent. Log an upcoming utility or service bill or upload a receipt to track upcoming dues."
              action={
                <button
                  onClick={() => setShowBillUpload(true)}
                  className="bg-[#FFFC00] text-black font-extrabold text-xs uppercase tracking-wider px-4 py-2 rounded-xl hover:bg-white hover:shadow-[0_0_20px_rgba(255,252,0,0.4)] active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Camera className="w-3.5 h-3.5 text-black" />
                  <span>Scan / Add Bill</span>
                </button>
              }
              tip="Pro Tip: Uploading receipt photos enables automatic OCR data extraction."
            />
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
                      onClick={() => openEditBill(b)}
                      className="p-1 text-stone/40 hover:text-gold transition-colors"
                      title="Edit bill"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
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
                    formatter={(value: unknown) => [`${currency}${Number(value) || 0}`, "Amount"]}
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
                        onClick={() => openEditTx(tx)}
                        className="p-1 text-stone/40 hover:text-gold transition-colors"
                        title="Edit transaction"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
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

      {/* 6. Daily Expense Ledger (Categorized Outflow Journal with Filters) */}
      <ExpenseLedger transactions={transactions} currency={currency} />

      {/* 7. Fortress Goals (Emergency Reserves & Capital Targets) */}
      <FortressGoals goals={goals} currency={currency} />

      {/* 8. The Impulse Purchase Shield (48h Cooling Vault) */}
      <ImpulseVault locks={locks} currency={currency} />

      {/* Edit Bill Modal */}
      {editingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-surface border border-border rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="text-sm font-serif font-bold text-ivory flex items-center gap-2">
                <Pencil className="w-4 h-4 text-gold" />
                Edit Bill
              </h4>
              <button
                onClick={() => setEditingBill(null)}
                className="text-stone hover:text-ivory text-sm cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editBillError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {editBillError}
              </div>
            )}

            <form onSubmit={handleUpdateBill} className="space-y-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
                  Bill / Vendor Name
                </label>
                <input
                  type="text"
                  required
                  value={editBillName}
                  onChange={(e) => setEditBillName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-obsidian border border-border rounded-lg text-ivory text-xs focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
                    Amount ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={editBillAmount}
                    onChange={(e) => setEditBillAmount(e.target.value)}
                    className="w-full px-3 py-1.5 bg-obsidian border border-border rounded-lg text-ivory text-xs focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editBillDate}
                    onChange={(e) => setEditBillDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-obsidian border border-border rounded-lg text-ivory text-xs focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone hover:text-ivory">
                  <input
                    type="checkbox"
                    checked={editBillPaid}
                    onChange={(e) => setEditBillPaid(e.target.checked)}
                    className="rounded border-border text-gold focus:ring-0 bg-obsidian w-4 h-4"
                  />
                  <span>Mark as paid</span>
                </label>
              </div>

              {editingBill.photoUrl && (
                <div className="text-[11px] text-stone">
                  Receipt:{" "}
                  <a
                    href={editingBill.photoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gold hover:underline"
                  >
                    View Attached Receipt
                  </a>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-border/80">
                <button
                  type="button"
                  onClick={() => setEditingBill(null)}
                  className="px-3.5 py-1.5 text-xs text-stone hover:text-ivory cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingBill}
                  className="px-4 py-1.5 bg-gold text-obsidian text-xs font-semibold rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isUpdatingBill ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-surface border border-border rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="text-sm font-serif font-bold text-ivory flex items-center gap-2">
                <Pencil className="w-4 h-4 text-gold" />
                Edit Transaction
              </h4>
              <button
                onClick={() => setEditingTx(null)}
                className="text-stone hover:text-ivory text-sm cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editTxError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {editTxError}
              </div>
            )}

            <form onSubmit={handleUpdateTx} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
                    Amount ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={editTxAmount}
                    onChange={(e) => setEditTxAmount(e.target.value)}
                    className="w-full px-3 py-1.5 bg-obsidian border border-border rounded-lg text-ivory text-xs focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
                    Category
                  </label>
                  <select
                    value={editTxCategory}
                    onChange={(e) => setEditTxCategory(e.target.value)}
                    className="w-full px-3 py-1.5 bg-obsidian border border-border rounded-lg text-ivory text-xs focus:outline-none focus:border-gold"
                  >
                    <option value="Food">Food & Groceries</option>
                    <option value="Transit">Transit & Fuel</option>
                    <option value="Shopping">Shopping & Discretionary</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Rent">Rent & Housing</option>
                    <option value="Bills">Bills & Utilities</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editTxDate}
                    onChange={(e) => setEditTxDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-obsidian border border-border rounded-lg text-ivory text-xs focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
                    Flow Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditTxType("expense")}
                      className={`py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                        editTxType === "expense"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold"
                          : "bg-obsidian text-stone border-border"
                      }`}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditTxType("income")}
                      className={`py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                        editTxType === "income"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold"
                          : "bg-obsidian text-stone border-border"
                      }`}
                    >
                      Income
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
                  Description / Merchant
                </label>
                <input
                  type="text"
                  required
                  value={editTxDesc}
                  onChange={(e) => setEditTxDesc(e.target.value)}
                  className="w-full px-3 py-1.5 bg-obsidian border border-border rounded-lg text-ivory text-xs focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/80">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-3.5 py-1.5 text-xs text-stone hover:text-ivory cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingTx}
                  className="px-4 py-1.5 bg-gold text-obsidian text-xs font-semibold rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isUpdatingTx ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
