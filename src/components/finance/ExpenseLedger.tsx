"use client";

import React, { useState } from "react";
import { Plus, Trash2, Calendar, ArrowDownRight, ArrowUpRight, Filter, Pencil, X, Utensils, Fuel, ShoppingBag, Film, Home, MoreHorizontal } from "lucide-react";
import { addTransaction, deleteTransaction, updateTransaction } from "@/app/actions";
import { EmptyState } from "@/components/ui/EmptyState";

interface TransactionItem {
  id: string;
  amount: number;
  category: string;
  type: string;
  date: string;
  description: string;
  createdAt?: Date | string;
}

interface ExpenseLedgerProps {
  transactions: TransactionItem[];
  currency: string;
}

const CATEGORIES = [
  { id: "all", label: "All Categories", color: "#FFFC00" },
  { id: "food", label: "Food & Groceries", color: "#00D664" },
  { id: "transport", label: "Transit & Fuel", color: "#FFFC00" },
  { id: "shopping", label: "Shopping & Discretionary", color: "#FF2D55" },
  { id: "entertainment", label: "Entertainment", color: "#A855F7" },
  { id: "needs", label: "Rent & Housing", color: "#06B6D4" },
  { id: "other", label: "Other Outflow", color: "#71717A" },
];

export function ExpenseLedger({ transactions, currency }: ExpenseLedgerProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  const [showAddForm, setShowAddForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [date, setDate] = useState(todayStr);
  const [description, setDescription] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit state
  const [editingTx, setEditingTx] = useState<TransactionItem | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("food");
  const [editType, setEditType] = useState<"expense" | "income">("expense");
  const [editDate, setEditDate] = useState(todayStr);
  const [editDescription, setEditDescription] = useState("");
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const openEditTx = (tx: TransactionItem) => {
    setEditingTx(tx);
    setEditAmount(tx.amount.toString());
    setEditCategory(tx.category.toLowerCase());
    setEditType(tx.type === "income" ? "income" : "expense");
    setEditDate(tx.date);
    setEditDescription(tx.description);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx || !editAmount || !editDescription) return;

    setIsEditSubmitting(true);
    try {
      await updateTransaction({
        id: editingTx.id,
        amount: parseFloat(editAmount),
        category: editCategory,
        type: editType,
        date: editDate,
        description: editDescription,
      });
      setEditingTx(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    setIsSubmitting(true);
    try {
      await addTransaction({
        amount: parseFloat(amount),
        category,
        type,
        date,
        description,
      });
      setAmount("");
      setDescription("");
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = transactions.filter((t) => {
    if (filterCategory === "all") return true;
    return t.category.toLowerCase() === filterCategory.toLowerCase();
  });

  // Group by date
  const groupedByDate: { [date: string]: TransactionItem[] } = {};
  filtered.forEach((t) => {
    if (!groupedByDate[t.date]) {
      groupedByDate[t.date] = [];
    }
    groupedByDate[t.date].push(t);
  });

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Stitch Design) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#141416] border border-[#26262B]">
        <div>
          <h3 className="text-base font-sans font-bold text-white tracking-tight flex items-center gap-2">
            Daily Spending
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5 font-mono">
            Quickly record everyday spending &amp; monitor capital burn velocity
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FFFC00] text-black font-extrabold text-xs rounded-xl hover:shadow-[0_0_20px_rgba(255,252,0,0.35)] active:scale-95 transition-all shadow-md shadow-[#FFFC00]/20 self-start sm:self-auto cursor-pointer"
          type="button"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Close Form" : "+ Add Expense"}</span>
        </button>
      </div>

      {/* Add Transaction Form */}
      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="p-5 rounded-xl bg-elevated border border-border space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
                Amount ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="45.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-obsidian border border-border rounded-lg text-ivory text-sm focus:outline-none focus:border-gold"
              />
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
                {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-obsidian border border-border rounded-lg text-ivory text-sm focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
                Flow Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                    type === "expense"
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold"
                      : "bg-obsidian text-stone border-border"
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                    type === "income"
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
              placeholder="e.g. Weekly grocery run, utility electric bill"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-obsidian border border-border rounded-lg text-ivory text-sm focus:outline-none focus:border-gold"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs text-stone hover:text-ivory transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-gold text-obsidian text-xs font-semibold rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Commit Transaction"}
            </button>
          </div>
        </form>
      )}

      {/* Category Quick-Selection Pills (Stitch Architecture) */}
      <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
        {CATEGORIES.map((cat) => {
          const isSelected = filterCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setFilterCategory(cat.id);
                if (cat.id !== "all") {
                  setCategory(cat.id);
                }
              }}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? "bg-[#FFFC00] text-black border-[#FFFC00] shadow-md shadow-[#FFFC00]/20 font-bold"
                  : "bg-[#1C1C20] hover:bg-[#24242C] border-[#2E2E35] text-zinc-300 hover:text-white"
              }`}
              type="button"
            >
              {cat.id !== "all" && (
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
              )}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Ledger Table Grouped by Date */}
      {sortedDates.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Transactions Logged"
          description="Your financial fortress begins with awareness. Record an income movement or daily expense to track your cash velocity and burn rate."
          action={
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-[#FFFC00] text-black font-extrabold text-xs uppercase tracking-wider px-4 py-2 rounded-xl hover:bg-white hover:shadow-[0_0_20px_rgba(255,252,0,0.4)] active:scale-95 transition-all cursor-pointer"
            >
              + Record First Movement
            </button>
          }
          tip="Pro Tip: Tagging expenditures builds an honest view of discretionary outflows."
        />
      ) : (
        <div className="space-y-4">
          {sortedDates.map((dateStr) => {
            const dayItems = groupedByDate[dateStr];
            const dayExpenseSum = dayItems
              .filter((i) => i.type === "expense")
              .reduce((acc, i) => acc + i.amount, 0);

            const isToday = dateStr === todayStr;

            return (
              <div key={dateStr} className="rounded-xl bg-surface border border-border overflow-hidden">
                {/* Date Header */}
                <div className="px-5 py-3 bg-surface/80 border-b border-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-stone" />
                    <span className="text-xs font-semibold text-ivory">
                      {isToday ? "Today, " : ""}
                      {new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="text-xs font-mono font-medium text-stone">
                    Total: <span className="text-ivory font-bold">{currency}{dayExpenseSum.toFixed(2)}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-border/40">
                  {dayItems.map((tx) => (
                    <div
                      key={tx.id}
                      className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-elevated/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            tx.type === "income"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-surface text-stone border border-border"
                          }`}
                        >
                          {tx.type === "income" ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="text-sm font-medium text-ivory truncate">
                            {tx.description}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-muted mt-0.5">
                            <span className="capitalize">{tx.category}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div
                          className={`text-sm font-serif font-bold ${
                            tx.type === "income" ? "text-emerald-400" : "text-ivory"
                          }`}
                        >
                          {tx.type === "income" ? "+" : "-"}
                          {currency}{tx.amount.toFixed(2)}
                        </div>

                        <button
                          onClick={() => openEditTx(tx)}
                          className="text-stone/50 hover:text-gold p-1 transition-colors"
                          title="Edit transaction"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="text-stone/50 hover:text-rose-400 p-1 transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
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
                className="text-stone hover:text-ivory text-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
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
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-obsidian border border-border rounded-lg text-ivory text-sm focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-obsidian border border-border rounded-lg text-ivory text-sm focus:outline-none focus:border-gold"
                  >
                    {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
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
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 bg-obsidian border border-border rounded-lg text-ivory text-sm focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-muted mb-1">
                    Flow Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditType("expense")}
                      className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                        editType === "expense"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold"
                          : "bg-obsidian text-stone border-border"
                      }`}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditType("income")}
                      className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                        editType === "income"
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
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-border rounded-lg text-ivory text-sm focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2 text-xs text-stone hover:text-ivory transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditSubmitting}
                  className="px-5 py-2 bg-gold text-obsidian text-xs font-semibold rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50"
                >
                  {isEditSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
