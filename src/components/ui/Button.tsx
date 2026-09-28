"use client";

import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className = "",
  variant = "primary",
  size = "md",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-[var(--radius-sm)] font-medium transition-colors btn-press focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[var(--accent-gold)] text-[var(--bg-obsidian)] hover:bg-[var(--accent-gold-hover)]",
    secondary: "bg-transparent border border-[var(--border-default)] text-[var(--text-ivory)] hover:bg-[var(--bg-elevated)]",
    ghost: "bg-transparent text-[var(--text-stone)] hover:bg-[var(--bg-surface)]",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-2.5 text-sm",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
