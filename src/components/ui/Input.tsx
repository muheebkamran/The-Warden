"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, id, className, ...props }: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs text-stone font-medium">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-sm bg-surface border border-border px-3 py-2 text-sm text-ivory placeholder:text-muted transition-all duration-200",
          "hover:border-stone/50 hover:bg-elevated",
          "focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold focus:bg-obsidian",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    </div>
  );
}
