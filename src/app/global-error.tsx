"use client";

import React, { useEffect } from "react";
import { ShieldAlert, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[WARDEN CRITICAL ROOT ERROR]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#070709] text-zinc-100 flex items-center justify-center p-4 font-sans m-0">
        <div className="w-full max-w-lg bg-[#0e0e12] border border-[#222227] rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FF2D55]/10 border border-[#FF2D55]/30 flex items-center justify-center text-[#FF2D55] mx-auto mb-5">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <span className="font-mono text-[10px] uppercase tracking-widest text-[#FF2D55] font-bold px-2.5 py-1 rounded-full bg-[#FF2D55]/10 border border-[#FF2D55]/20 inline-block mb-3">
            CRITICAL KERNEL FAULT
          </span>

          <h1 className="text-2xl font-black text-white mb-2">
            The Warden Shell Desynchronized
          </h1>

          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            A critical fault occurred in the application root layer. Your local data remains securely encrypted and preserved.
          </p>

          <button
            onClick={() => reset()}
            className="w-full py-3.5 px-4 rounded-xl bg-[#FFFC00] hover:bg-[#fff933] text-black font-extrabold text-xs tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer border-none"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reinitialize Application</span>
          </button>
        </div>
      </body>
    </html>
  );
}
