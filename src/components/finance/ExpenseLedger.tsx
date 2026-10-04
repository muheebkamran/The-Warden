"use client";

import React, { useState } from "react";
import { Plus, Trash2, Calendar, Tag, ArrowDownRight, ArrowUpRight, Filter } from "lucide-react";
import { addTransaction, deleteTransaction } from "@/app/actions";

interface TransactionItem {
  id: string;
  amount: number;
  category: string;
  type: string;
  date: string;
  description: string;
  createdAt: Date | string;
}

interface ExpenseLedgerProps {
  transactions: TransactionItem[];
  currency: string;
}

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "food", label: "Food & Groceries" },
  { id: "needs", label: "Needs & Rent" },
  { id: "transport", label: "Transit & Fuel" },
  { id: "bills", label: "Bills & Subscriptions" },
  { id: "entertainment", label: "Entertainment" },
  { id: "shopping", label: "Discretionary / Gear" },
  { id: "other", label: "Other" },
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
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-surface border border-border">
        <div>
          <h3 className="text-base font-serif font-semibold text-ivory tracking-wide flex items-center gap-2">
            Daily Expense Ledger
          </h3>
          <p className="text-xs text-stone mt-1">
            Exact record of outflows. Acknowledge every transaction without rationalization.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gold text-obsidian text-xs font-semibold rounded-lg hover:bg-gold/90 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? "Close Form" : "Log Expense"}
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

      {/* Category Pills Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <Filter className="w-3.5 h-3.5 text-muted shrink-0 mr-1" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
              filterCategory === cat.id
                ? "bg-gold text-obsidian font-semibold shadow-sm"
                : "bg-surface text-stone hover:text-ivory hover:bg-elevated border border-border"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Ledger Table Grouped by Date */}
      {sortedDates.length === 0 ? (
        <div className="p-8 rounded-xl bg-surface/50 border border-border/60 text-center space-y-2">
          <Calendar className="w-8 h-8 text-stone/40 mx-auto" />
          <p className="text-sm text-stone font-medium">No transactions found</p>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Log your daily expenses to establish honest financial discipline and watch your burn rate.
          </p>
        </div>
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
    </div>
  );
}
