"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, ShieldAlert, ArrowLeft } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to telemetry
    console.error("[WARDEN RUNTIME SENTINEL] Unhandled route error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex items-center justify-center p-4 selection:bg-[#FFFC00] selection:text-black">
      <div className="w-full max-w-lg bg-[#0e0e12] border border-[#222227] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF2D55] to-transparent" />

        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FF2D55]/10 border border-[#FF2D55]/30 flex items-center justify-center text-[#FF2D55] mb-5 shadow-lg shadow-[#FF2D55]/5">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <span className="font-mono text-[10px] uppercase tracking-widest text-[#FF2D55] font-bold px-2.5 py-1 rounded-full bg-[#FF2D55]/10 border border-[#FF2D55]/20 mb-3">
            ANOMALY INTERCEPTED
          </span>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2">
            System Execution Interrupted
          </h1>

          <p className="text-zinc-400 text-sm leading-relaxed mb-6 max-w-md">
            The Warden sentinel intercepted an unexpected runtime exception. All telemetry states have been isolated to protect ledger integrity.
          </p>

          {error?.digest && (
            <div className="w-full bg-[#141418] border border-[#222227] rounded-lg p-3 font-mono text-[11px] text-zinc-400 mb-6 text-left flex items-center justify-between">
              <span className="text-zinc-500">DIGEST ID:</span>
              <span className="text-[#FFFC00] font-bold">{error.digest}</span>
            </div>
          )}

          <div className="w-full flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => reset()}
              className="flex-1 py-3 px-4 rounded-xl bg-[#FFFC00] hover:bg-[#fff933] text-black font-extrabold text-xs tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-[#FFFC00]/10"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Operation</span>
            </button>

            <Link
              href="/dashboard"
              className="flex-1 py-3 px-4 rounded-xl bg-[#18181e] hover:bg-[#202028] text-white font-extrabold text-xs tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-2 border border-[#2e2e38] active:scale-[0.98]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Command Center</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
