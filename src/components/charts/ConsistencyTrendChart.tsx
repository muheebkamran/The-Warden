"use client";

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import type { ConsistencyTrendPoint } from '@/lib/chartData';

interface ConsistencyTrendChartProps {
  data: ConsistencyTrendPoint[];
}

export function ConsistencyTrendChart({ data }: ConsistencyTrendChartProps) {
  return (
    <Card className="p-6 md:p-8 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">
            30-Day Consistency Trend
          </h2>
          <p className="text-xs text-stone mt-1">
            Daily execution rate against the 70% threshold
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-gold)]" />
          <span className="text-stone">Completion %</span>
        </div>
      </div>

      <div className="w-full h-64 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C8A96B" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#C8A96B" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(255, 255, 255, 0.05)"
            />
            <XAxis
              dataKey="displayDate"
              stroke="#62646A"
              fontSize={10}
              tickLine={false}
              interval="preserveStartEnd"
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 70, 100]}
              unit="%"
              stroke="#62646A"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as ConsistencyTrendPoint;
                  return (
                    <div className="bg-[#1A1D22] border border-[#292C32] p-3 rounded-md shadow-xl text-xs space-y-1">
                      <div className="font-semibold text-[#F2F0EA]">{item.displayDate}</div>
                      <div className="text-[#C8A96B]">
                        Rate: <span className="font-bold">{item.completionRate}%</span>
                      </div>
                      <div className="text-[#9A9A96]">
                        Habits: {item.habitsKept} / {item.habitsTotal}
                      </div>
                      <div className="pt-1">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            item.passed
                              ? 'bg-[#7FA889]/20 text-[#7FA889]'
                              : 'bg-[#B56B6B]/20 text-[#B56B6B]'
                          }`}
                        >
                          {item.passed ? 'STANDARD MET' : 'MISSED'}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine
              y={70}
              stroke="#C8A96B"
              strokeDasharray="4 4"
              strokeOpacity={0.7}
              label={{
                value: '70% Standard',
                position: 'insideTopRight',
                fill: '#C8A96B',
                fontSize: 10,
              }}
            />
            <Area
              type="monotone"
              dataKey="completionRate"
              stroke="#C8A96B"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#goldGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
