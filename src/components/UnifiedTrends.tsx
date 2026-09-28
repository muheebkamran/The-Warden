"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

interface DayData {
  day: string;
  date: string;
  habitsCompleted: number;
  focusHours: number;
  phoneHours: number;
  sleepHours: number | null;
}

interface UnifiedTrendsProps {
  data: DayData[];
  monthLabel: string;
}

export function UnifiedTrends({ data, monthLabel }: UnifiedTrendsProps) {
  const hasData = data.some(
    (d) => d.habitsCompleted > 0 || d.focusHours > 0 || d.phoneHours > 0 || d.sleepHours !== null
  );

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Top Header Bar */}
      <header className="h-16 bg-white border-b border-zinc-200 px-8 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Trends & Biometrics
          </h1>
          <p className="text-xs text-zinc-500">
            Performance Analytics · {monthLabel}
          </p>
        </div>
      </header>

      {/* Main Body */}
      <div className="p-8 max-w-7xl mx-auto w-full flex-1">
        {!hasData ? (
          <EmptyState
            icon={TrendingUp}
            title="No Biometric Trends Yet"
            description="As you check off habits and record daily sleep, wake, or focus times, comprehensive volume and trend charts will render here."
          />
        ) : (
          <div className="space-y-6">
            {/* Habits Completed Bar Chart */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    Daily Disciplines Completed
                  </h3>
                  <p className="text-xs text-zinc-400">Total volume per day</p>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <XAxis
                      dataKey="day"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#e2e8f0",
                        borderRadius: "12px",
                        fontSize: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="habitsCompleted"
                      name="Disciplines"
                      fill="#2563eb"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Focus Hours vs Screen Time Area Chart */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    Focus Hours vs Phone Screen Time
                  </h3>
                  <p className="text-xs text-zinc-400">Comparative hours per day</p>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="phoneGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#e2e8f0",
                        borderRadius: "12px",
                        fontSize: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="focusHours"
                      name="Focus (h)"
                      stroke="#2563eb"
                      fillOpacity={1}
                      fill="url(#focusGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="phoneHours"
                      name="Phone Screen (h)"
                      stroke="#ef4444"
                      fillOpacity={1}
                      fill="url(#phoneGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
