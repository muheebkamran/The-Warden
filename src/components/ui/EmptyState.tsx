"use client";

import React from "react";
import { LucideIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  tip?: string;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  secondaryAction,
  tip,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-[#18181B] border border-[#26262B] p-8 sm:p-10 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden w-full max-w-xl mx-auto animate-fade-in",
        className
      )}
    >
      {/* Ambient background glow */}
      <div 
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-36 bg-[#FFFC00]/[0.05] rounded-full blur-3xl pointer-events-none" 
        aria-hidden="true" 
      />

      {/* High-Voltage Icon Container */}
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-[#202024] border border-[#2E2E34] text-[#FFFC00] flex items-center justify-center mb-4 shadow-md shrink-0">
          <Icon className="w-7 h-7" strokeWidth={1.8} />
        </div>
      )}

      {/* Directional Content */}
      <h3 className="font-sans font-bold text-lg sm:text-xl text-white tracking-tight mb-2">
        {title}
      </h3>
      <p className="font-sans text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed mb-6">
        {description}
      </p>

      {/* Action Buttons */}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      )}

      {/* Helpful Onboarding Hint */}
      {tip && (
        <div className="mt-6 pt-4 border-t border-[#26262B]/80 w-full flex items-center justify-center">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono text-[#FFFC00] bg-[#FFFC00]/5 px-3.5 py-1.5 rounded-full border border-[#FFFC00]/20">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#FFFC00]" />
            <span>{tip}</span>
          </div>
        </div>
      )}
    </div>
  );
}
