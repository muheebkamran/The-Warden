"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

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
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { contextSafe } = useGSAP({ scope: buttonRef });

  const handlePointerDown = contextSafe(() => {
    if (disabled) return;
    gsap.to(buttonRef.current, {
      scale: 0.95,
      duration: 0.15,
      ease: "power2.out",
      overwrite: true,
    });
  });

  const handlePointerUp = contextSafe(() => {
    if (disabled) return;
    gsap.to(buttonRef.current, {
      scale: 1,
      duration: 0.4,
      ease: "elastic.out(1.2, 0.4)",
      overwrite: true,
    });
  });

  const variants = {
    primary: "bg-gold text-obsidian hover:bg-gold-hover hover:shadow-[0_0_12px_rgba(200,169,107,0.3)] shadow-none transition-shadow",
    secondary: "bg-transparent border border-border text-ivory hover:bg-elevated",
    ghost: "bg-transparent text-stone hover:bg-surface hover:text-ivory",
    danger: "bg-transparent border border-error/50 text-error hover:bg-error/10",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-2.5 text-sm",
    icon: "p-2",
  };

  return (
    <button
      ref={buttonRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={cn(
        "inline-flex items-center justify-center rounded-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian disabled:opacity-50 disabled:cursor-not-allowed select-none",
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
