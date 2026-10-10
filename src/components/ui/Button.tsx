"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  disabled,
  loading = false,
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-[#FFFC00] text-black font-extrabold hover:bg-white hover:shadow-[0_0_20px_rgba(255,252,0,0.4)] active:scale-[0.98] transition-all",
    secondary:
      "bg-[#18181B] border border-[#26262B] text-white hover:border-[#FFFC00]/60 hover:text-[#FFFC00] hover:bg-[#202024] active:scale-[0.98] transition-all",
    ghost:
      "bg-transparent text-zinc-400 hover:text-white hover:bg-[#1A1A1E] active:scale-[0.98] transition-all",
    danger:
      "bg-[#FF2D55]/10 border border-[#FF2D55]/30 text-[#FF2D55] hover:bg-[#FF2D55]/20 hover:border-[#FF2D55] active:scale-[0.98] transition-all",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-lg min-h-[30px]",
    md: "px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-xl min-h-[36px]",
    lg: "px-6 py-2.5 text-sm font-mono uppercase tracking-wider rounded-xl min-h-[42px]",
    icon: "p-2 rounded-xl min-w-[36px] min-h-[36px]",
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFFC00]/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 select-none shadow-none cursor-pointer",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isDisabled}
      aria-busy={loading ? "true" : undefined}
      aria-disabled={isDisabled ? "true" : undefined}
      {...props}
    >
      {loading ? (
        <>
          <Loader2
            className={cn(
              "animate-spin shrink-0",
              size === "icon" ? "w-4 h-4" : "w-3.5 h-3.5 mr-2"
            )}
            aria-hidden="true"
          />
          {size !== "icon" && <span>{children}</span>}
        </>
      ) : (
        children
      )}
    </button>
  );
}
