"use client";

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import type { WeeklyVelocityPoint } from '@/lib/chartData';

interface WeeklyVelocityChartProps {
  data: WeeklyVelocityPoint[];
}

export function WeeklyVelocityChart({ data }: WeeklyVelocityChartProps) {
  return (
    <Card className="p-6 md:p-8 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">
            Weekly Velocity
          </h2>
          <p className="text-xs text-stone mt-1">
            Days meeting the 70% standard across the last 4 weeks
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-sm bg-[var(--color-gold)]" />
          <span className="text-stone">Passed</span>
          <span className="w-2.5 h-2.5 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)] ml-2" />
          <span className="text-muted">Target</span>
        </div>
      </div>

      <div className="w-full h-64 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(255, 255, 255, 0.05)"
            />
            <XAxis
              dataKey="week"
              stroke="#62646A"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
            />
            <YAxis
              domain={[0, 7]}
              ticks={[0, 2, 4, 5, 7]}
              stroke="#62646A"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(200, 169, 107, 0.05)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as WeeklyVelocityPoint;
                  return (
                    <div className="bg-[#1A1D22] border border-[#292C32] p-3 rounded-md shadow-xl text-xs space-y-1">
                      <div className="font-semibold text-[#F2F0EA]">{item.week}</div>
                      <div className="text-[#C8A96B]">
                        Passed Days: <span className="font-bold">{item.passedDays} / 7</span>
                      </div>
                      <div className="text-[#9A9A96]">
                        Habits Kept: <span className="text-[#F2F0EA]">{item.habitsKept} / {item.habitsTarget}</span>
                      </div>
                      <div className="text-[#62646A]">
                        Success Rate: {item.completionRate}%
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine
              y={5}
              stroke="#C8A96B"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
              label={{
                value: '70% Standard (5d)',
                position: 'insideTopRight',
                fill: '#C8A96B',
                fontSize: 10,
              }}
            />
            <Bar dataKey="passedDays" radius={[4, 4, 0, 0]} maxBarSize={42}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.passedDays >= 5 ? '#C8A96B' : 'rgba(200, 169, 107, 0.45)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
