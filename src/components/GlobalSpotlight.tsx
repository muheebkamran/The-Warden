"use client";

import React, { useEffect, useRef } from "react";

export function GlobalSpotlight() {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mouseX = -500;
    let mouseY = -500;
    let currentX = -500;
    let currentY = -500;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const animate = () => {
      currentX += (mouseX - currentX) * 0.1;
      currentY += (mouseY - currentY) * 0.1;

      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(260px circle at ${Math.round(currentX)}px ${Math.round(currentY)}px, rgba(200, 169, 107, 0.12) 0%, transparent 100%)`;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* 260px Soft Gold Spotlight Following Cursor Smoothly */}
      <div
        ref={spotlightRef}
        className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
        style={{
          background: "radial-gradient(260px circle at -500px -500px, rgba(200, 169, 107, 0.12) 0%, transparent 100%)",
        }}
      />

      {/* Subtle Scattered Background Discipline Text (0.07-0.08 Opacity) */}
      <div className="absolute top-24 left-8 font-mono text-[10px] tracking-[0.4em] uppercase text-[#c8a96b]/[0.07] select-none">
        KEEP YOUR WORD
      </div>
      <div className="absolute top-1/3 right-12 font-mono text-[11px] tracking-[0.4em] uppercase text-[#c8a96b]/[0.06] select-none">
        70% DISCIPLINE
      </div>
      <div className="absolute bottom-28 left-16 font-mono text-[10px] tracking-[0.35em] uppercase text-[#c8a96b]/[0.06] select-none">
        CONSISTENCY OVER PERFECTION
      </div>
      <div className="absolute bottom-16 right-20 font-mono text-[10px] tracking-[0.35em] uppercase text-[#c8a96b]/[0.07] select-none">
        DAILY STREAK
      </div>
    </div>
  );
}
