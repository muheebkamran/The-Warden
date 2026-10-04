"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-[#c8a96b] text-[#0b0c0e] font-semibold hover:bg-[#d4b87a] hover:scale-[1.02] active:scale-[0.98]",
    secondary: "bg-transparent border border-[#3a3244] text-[#f2f0ea] hover:border-[#f2f0ea] hover:bg-[#1a1d22] hover:scale-[1.02] active:scale-[0.98]",
    ghost: "bg-transparent text-[#9a9a96] hover:text-[#f2f0ea] hover:bg-[#1a1d22] hover:scale-[1.02] active:scale-[0.98]",
    danger: "bg-transparent border border-[#b56b6b]/40 text-[#b56b6b] hover:bg-[#b56b6b]/10 hover:border-[#b56b6b] hover:scale-[1.02] active:scale-[0.98]",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm",
    md: "px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-md",
    lg: "px-6 py-2.5 text-sm font-mono uppercase tracking-wider rounded-md",
    icon: "p-2 rounded-sm",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#c8a96b] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 select-none shadow-none cursor-pointer",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
