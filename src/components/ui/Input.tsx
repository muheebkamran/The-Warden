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
        <label htmlFor={inputId} className="font-mono text-[11px] uppercase tracking-wider text-[#9a9a96]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-md bg-[#0b0c0e] border border-[#292c32] px-3.5 py-2.5 text-sm text-[#f2f0ea] placeholder:text-[#62646a] transition-all duration-150",
          "hover:border-[#3a3244]",
          "focus:outline-none focus:border-[#c8a96b] focus:ring-2 focus:ring-[#c8a96b]/20",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    </div>
  );
}
