"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface WardenLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  showText?: boolean;
  glow?: boolean;
  className?: string;
}

const SIZE_MAP: Record<string, number> = {
  xs: 20,
  sm: 32,
  md: 40,
  lg: 64,
  xl: 96,
};

export function WardenLogo({
  size = "md",
  showText = false,
  glow = false,
  className,
}: WardenLogoProps) {
  const pixelSize = typeof size === "number" ? size : SIZE_MAP[size] || 40;

  // Standalone Mascot Glyph (Optimized for small icons & navigation bars)
  if (!showText) {
    return (
      <div
        className={cn(
          "relative inline-flex items-center justify-center shrink-0 select-none overflow-visible",
          className
        )}
        style={{ width: pixelSize, height: pixelSize }}
      >
        {glow && (
          <div
            className="absolute inset-0 rounded-full bg-[#FFFC00]/30 blur-md pointer-events-none -z-10 animate-pulse"
            aria-hidden="true"
          />
        )}
        <svg
          viewBox="120 120 260 250"
          width={pixelSize}
          height={pixelSize}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_8px_rgba(255,252,0,0.3)] transition-transform duration-200"
        >
          {/* Yellow Mascot Body Silhouette */}
          <path
            d="
              M 250 140
              C 200 140, 185 180, 185 220
              C 185 228, 160 226, 155 235
              C 150 245, 165 252, 182 254
              C 178 268, 160 295, 135 308
              C 150 318, 175 305, 195 295
              C 215 328, 235 340, 250 340
              C 265 340, 285 328, 305 295
              C 325 305, 350 318, 365 308
              C 340 295, 322 268, 318 254
              C 335 252, 350 245, 345 235
              C 340 226, 315 228, 315 220
              C 315 180, 300 140, 250 140
              Z
            "
            fill="#FFFC00"
            stroke="#000000"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Sinister Angled Eyes */}
          <path
            d="M 210 196 Q 228 202 240 216 Q 225 215 210 207 Q 202 201 210 196 Z"
            fill="#000000"
          />
          <path
            d="M 290 196 Q 272 202 260 216 Q 275 215 290 207 Q 298 201 290 196 Z"
            fill="#000000"
          />

          {/* Neck Loop / Cord */}
          <path
            d="
              M 165 268 
              C 165 254, 335 252, 335 266 
              C 335 280, 225 288, 175 276
              C 160 272, 155 268, 165 268 Z
            "
            fill="#000000"
            stroke="#FFFC00"
            strokeWidth="2"
          />
          <path
            d="M 170 272 Q 240 286 325 268"
            stroke="#000000"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M 160 268 Q 230 282 315 265"
            stroke="#FFFC00"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 178 273 C 160 280, 158 292, 180 286 C 195 282, 185 273, 178 273 Z"
            fill="#000000"
            stroke="#FFFC00"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    );
  }

  // Full Brand Emblem with "THE" and "WARDEN" Typography
  return (
    <div
      className={cn(
        "relative inline-flex flex-col items-center justify-center shrink-0 select-none overflow-visible",
        className
      )}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {glow && (
        <div
          className="absolute inset-0 rounded-2xl bg-[#FFFC00]/20 blur-xl pointer-events-none -z-10"
          aria-hidden="true"
        />
      )}
      <svg
        viewBox="0 0 500 500"
        width={pixelSize}
        height={pixelSize}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_16px_rgba(255,252,0,0.25)]"
      >
        {/* Background container */}
        <rect width="500" height="500" rx="36" fill="#0b0c0e" stroke="#222227" strokeWidth="4" />

        {/* Top "THE" Typography */}
        <text
          x="250"
          y="85"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="system-ui, -apple-system, 'SF Pro Display', sans-serif"
          fontSize="44"
          fontWeight="900"
          letterSpacing="0.28em"
        >
          THE
        </text>

        {/* Center Mascot Body */}
        <path
          d="
            M 250 140
            C 200 140, 185 180, 185 220
            C 185 228, 160 226, 155 235
            C 150 245, 165 252, 182 254
            C 178 268, 160 295, 135 308
            C 150 318, 175 305, 195 295
            C 215 328, 235 340, 250 340
            C 265 340, 285 328, 305 295
            C 325 305, 350 318, 365 308
            C 340 295, 322 268, 318 254
            C 335 252, 350 245, 345 235
            C 340 226, 315 228, 315 220
            C 315 180, 300 140, 250 140
            Z
          "
          fill="#FFFC00"
          stroke="#000000"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Sinister Eyes */}
        <path
          d="M 210 196 Q 228 202 240 216 Q 225 215 210 207 Q 202 201 210 196 Z"
          fill="#000000"
        />
        <path
          d="M 290 196 Q 272 202 260 216 Q 275 215 290 207 Q 298 201 290 196 Z"
          fill="#000000"
        />

        {/* Neck Loop / Cord */}
        <path
          d="
            M 165 268 
            C 165 254, 335 252, 335 266 
            C 335 280, 225 288, 175 276
            C 160 272, 155 268, 165 268 Z
          "
          fill="#000000"
          stroke="#FFFC00"
          strokeWidth="2"
        />
        <path
          d="M 170 272 Q 240 286 325 268"
          stroke="#000000"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M 160 268 Q 230 282 315 265"
          stroke="#FFFC00"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 178 273 C 160 280, 158 292, 180 286 C 195 282, 185 273, 178 273 Z"
          fill="#000000"
          stroke="#FFFC00"
          strokeWidth="1.5"
        />

        {/* Bottom "WARDEN" Typography */}
        <text
          x="250"
          y="425"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="system-ui, -apple-system, 'SF Pro Display', sans-serif"
          fontSize="52"
          fontWeight="900"
          letterSpacing="0.24em"
        >
          WARDEN
        </text>
      </svg>
    </div>
  );
}

export default WardenLogo;
