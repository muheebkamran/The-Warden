"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface SpendingTrendChartProps {
  transactions: {
    amount: number;
    type: string;
    date: string;
    category?: string;
  }[];
  bills?: {
    amount: number;
    date: string;
  }[];
  currency: string;
  monthKey: string; // YYYY-MM
  monthLabel: string;
}

export function SpendingTrendChart({
  transactions,
  bills = [],
  currency,
  monthKey,
  monthLabel,
}: SpendingTrendChartProps) {
  const { data, totalSpent, daysInMonth } = useMemo(() => {
    const dailyMap: { [day: number]: number } = {};

    // Parse days in this month
    const [yearStr, monthStr] = monthKey.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10); // 1-indexed
    const numDays = new Date(year, month, 0).getDate();

    // Initialize all days
    for (let d = 1; d <= numDays; d++) {
      dailyMap[d] = 0;
    }

    // Add daily variable expenses
    transactions
      .filter((t) => t.type === "expense" && t.date.startsWith(monthKey))
      .forEach((t) => {
        const day = parseInt(t.date.split("-")[2], 10);
        if (!isNaN(day) && day >= 1 && day <= numDays) {
          dailyMap[day] = (dailyMap[day] || 0) + t.amount;
        }
      });

    // Add bills
    bills
      .filter((b) => b.date.startsWith(monthKey))
      .forEach((b) => {
        const day = parseInt(b.date.split("-")[2], 10);
        if (!isNaN(day) && day >= 1 && day <= numDays) {
          dailyMap[day] = (dailyMap[day] || 0) + b.amount;
        }
      });

    // Build sorted time-series with cumulative running total
    const sortedDays = Object.keys(dailyMap)
      .map(Number)
      .sort((a, b) => a - b);

    let runningTotal = 0;
    const series = [];
    for (const day of sortedDays) {
      const daily = dailyMap[day];
      runningTotal += daily;
      const dateObj = new Date(year, month - 1, day);
      const dateFormatted = dateObj.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });

      series.push({
        day,
        dateFormatted,
        daily: Math.round(daily * 100) / 100,
        cumulative: Math.round(runningTotal * 100) / 100,
      });
    }

    return { data: series, totalSpent: runningTotal, daysInMonth: numDays };
  }, [monthKey, transactions, bills]);

  return (
    <div className="rounded-xl bg-surface border border-border p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/80">
        <div>
          <h3 className="text-sm font-serif font-bold text-ivory flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gold" />
            Spending Flow & Cumulative Burn Velocity
          </h3>
          <p className="text-[11px] text-stone mt-0.5">
            Daily spikes (Line) overlaid on month-to-date cumulative capital outflows (Area)
          </p>
        </div>

        <div className="text-xs font-mono text-stone">
          M-T-D Total: <span className="text-gold font-bold">{currency}{totalSpent.toFixed(2)}</span>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        {totalSpent === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-stone italic">
            No spending recorded for {monthLabel}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cumulativeGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0.01} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" opacity={0.6} />

              <XAxis
                dataKey="dateFormatted"
                stroke="#71717a"
                tick={{ fill: "#a1a1aa", fontSize: 10 }}
                interval={Math.ceil(daysInMonth / 8)}
                tickLine={false}
              />

              <YAxis
                stroke="#71717a"
                tick={{ fill: "#a1a1aa", fontSize: 10 }}
                tickFormatter={(val) => `${currency}${val}`}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#09090b",
                  borderColor: "#27272a",
                  borderRadius: "6px",
                  fontSize: "11px",
                  color: "#f4f4f5",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                }}
                formatter={(value: unknown, name: unknown) => [
                  `${currency}${Number(value) || 0}`,
                  String(name) === "cumulative" ? "Cumulative Burn" : "Daily Outflow",
                ]}
                labelStyle={{ color: "#a1a1aa", marginBottom: "4px" }}
              />

              <Legend
                verticalAlign="top"
                align="right"
                iconSize={8}
                wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }}
                formatter={(val) => (val === "cumulative" ? "Cumulative Burn (Area)" : "Daily Outflow (Line)")}
              />

              {/* Background Area: Cumulative Running Sum */}
              <Area
                type="monotone"
                dataKey="cumulative"
                fill="url(#cumulativeGold)"
                stroke="#ca8a04"
                strokeWidth={1.5}
                isAnimationActive={true}
                animationDuration={600}
                animationEasing="cubic-bezier(0.16, 1, 0.3, 1)"
              />

              {/* Foreground Line: Daily Spikes */}
              <Line
                type="monotone"
                dataKey="daily"
                stroke="#eab308"
                strokeWidth={2}
                dot={{ r: 2, fill: "#eab308", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#fde047" }}
                isAnimationActive={true}
                animationDuration={600}
                animationEasing="cubic-bezier(0.16, 1, 0.3, 1)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
