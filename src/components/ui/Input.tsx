"use client";

import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, id, className = "", ...props }: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs text-[var(--text-stone)] font-medium">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-[var(--radius-sm)] bg-[var(--bg-surface)] border border-[var(--border-default)] px-3 py-2 text-sm text-[var(--text-ivory)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    </div>
  );
}
