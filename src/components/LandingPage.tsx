"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Flame, 
  Wallet, 
  BookOpen, 
  ArrowRight, 
  ChevronRight, 
  Menu, 
  X, 
  Shield, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  TrendingUp,
  Receipt
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Spotlight mouse tracking with smooth lerp
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 500, y: 350 });
  const [renderedPos, setRenderedPos] = useState({ x: 500, y: 350 });

  useEffect(() => {
    let animationFrameId: number;
    let currentX = mousePos.x;
    let currentY = mousePos.y;

    const animate = () => {
      // Lerp 0.1 for silky smooth movement
      currentX += (mousePos.x - currentX) * 0.1;
      currentY += (mousePos.y - currentY) * 0.1;
      setRenderedPos({ x: Math.round(currentX), y: Math.round(currentY) });
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mousePos]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-[#f2f0ea] selection:bg-[#c8a96b]/30 selection:text-[#f2f0ea] font-sans antialiased overflow-x-hidden">
      
      {/* ─── FIXED TOP NAVIGATION BAR ─────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 md:h-20 bg-[#0b0c0e]/80 backdrop-blur-xl border-b border-[#292c32]/60 px-4 sm:px-8 flex items-center justify-between transition-all duration-200">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-sm bg-[#1a1d22] border border-[#3a3244] flex items-center justify-center text-[#c8a96b] group-hover:border-[#c8a96b] transition-colors duration-200">
              <Shield size={18} className="transform group-hover:scale-105 transition-transform duration-200" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-base tracking-[0.22em] uppercase font-semibold text-[#f2f0ea]">
                The Warden
              </span>
              <span className="font-mono text-[9px] tracking-widest text-[#9a9a96] uppercase -mt-1">
                Lithos Engine
              </span>
            </div>
          </Link>
        </div>

        {/* Center Pill Nav (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#131519]/80 border border-[#292c32] shadow-inner text-xs font-medium text-[#9a9a96]">
          <a 
            href="#iron-rule" 
            className="px-3 py-1 rounded-full hover:text-[#f2f0ea] hover:bg-[#1a1d22] transition-all duration-200"
          >
            The Iron Rule
          </a>
          <a 
            href="#financial-telemetry" 
            className="px-3 py-1 rounded-full hover:text-[#f2f0ea] hover:bg-[#1a1d22] transition-all duration-200"
          >
            Financial Telemetry
          </a>
          <a 
            href="#reading-room" 
            className="px-3 py-1 rounded-full hover:text-[#f2f0ea] hover:bg-[#1a1d22] transition-all duration-200"
          >
            The Reading Room
          </a>
          <Link 
            href="/demo" 
            className="px-3 py-1 rounded-full hover:text-[#c8a96b] hover:bg-[#1a1d22] transition-all duration-200"
          >
            Live Preview
          </Link>
        </nav>

        {/* Right CTA Links */}
        <div className="hidden md:flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-xs uppercase tracking-wider font-mono text-[#9a9a96] hover:text-[#f2f0ea] transition-colors duration-200 px-3 py-2"
          >
            Log In
          </Link>
          <Link 
            href="/register" 
            className="px-5 py-2 rounded-full bg-[#f2f0ea] text-[#0b0c0e] font-semibold text-xs tracking-wider uppercase hover:bg-[#c8a96b] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 shadow-sm"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#9a9a96] hover:text-[#f2f0ea] focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 z-40 bg-[#0b0c0e]/95 backdrop-blur-2xl border-b border-[#292c32] p-6 space-y-4 animate-fade-in">
          <nav className="flex flex-col space-y-3 font-mono text-xs uppercase tracking-wider text-[#9a9a96]">
            <a 
              href="#iron-rule" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-[#f2f0ea]"
            >
              The Iron Rule
            </a>
            <a 
              href="#financial-telemetry" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-[#f2f0ea]"
            >
              Financial Telemetry
            </a>
            <a 
              href="#reading-room" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-[#f2f0ea]"
            >
              The Reading Room
            </a>
            <Link 
              href="/demo" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-[#c8a96b]"
            >
              Live Demo
            </Link>
          </nav>
          <div className="pt-4 border-t border-[#292c32] flex flex-col gap-3">
            <Link 
              href="/login" 
              className="w-full text-center py-2.5 rounded-md border border-[#3a3244] text-xs font-mono tracking-wider uppercase text-[#f2f0ea]"
            >
              Log In
            </Link>
            <Link 
              href="/register" 
              className="w-full text-center py-2.5 rounded-md bg-[#c8a96b] text-[#0b0c0e] font-semibold text-xs font-mono tracking-wider uppercase hover:bg-[#d4b87a]"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}

      {/* ─── HERO SECTION WITH CURSOR SPOTLIGHT ───────────────────────────── */}
      <section 
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative min-h-[92vh] md:min-h-screen pt-24 md:pt-28 flex flex-col justify-between px-6 sm:px-12 md:px-16 overflow-hidden cursor-crosshair border-b border-[#292c32]"
      >
        {/* Background Architectural Grid Pattern */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #292c32 1px, transparent 1px),
              linear-gradient(to bottom, #292c32 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px"
          }}
        />

        {/* Underlying Illuminated Layer Revealed by Spotlight */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            maskImage: `radial-gradient(260px circle at ${renderedPos.x}px ${renderedPos.y}px, black 0%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(260px circle at ${renderedPos.x}px ${renderedPos.y}px, black 0%, transparent 100%)`,
            background: "radial-gradient(circle at center, #1b1e25 0%, #101216 100%)",
          }}
        >
          {/* Lithos Etched Stone Topography / Circuit Telemetry Grid */}
          <div 
            className="absolute inset-0 opacity-40 mix-blend-color-dodge"
            style={{
              backgroundImage: `
                repeating-linear-gradient(45deg, rgba(200, 169, 107, 0.15) 0, rgba(200, 169, 107, 0.15) 1px, transparent 0, transparent 40px),
                repeating-linear-gradient(-45deg, rgba(200, 169, 107, 0.15) 0, rgba(200, 169, 107, 0.15) 1px, transparent 0, transparent 40px)
              `,
            }}
          />
          <div className="absolute top-1/3 left-1/4 text-[140px] font-serif italic text-[#c8a96b]/10 select-none pointer-events-none">
            DISCIPLINE
          </div>
        </div>

        {/* Cursor Radial Glow */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(260px circle at ${renderedPos.x}px ${renderedPos.y}px, rgba(200, 169, 107, 0.16) 0%, rgba(200, 169, 107, 0.04) 50%, transparent 100%)`
          }}
        />

        {/* Telemetry Header Line */}
        <div className="relative z-10 pt-4 flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] sm:text-xs tracking-widest text-[#9a9a96] uppercase">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#7fa889] animate-pulse" />
            <span>CORE PROTOCOL // OPERATIONAL</span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <span>GRID: 37°46&apos;N 122°25&apos;W</span>
            <span>SYSTEM: ZERO COMPROMISE</span>
          </div>
        </div>

        {/* Hero Title & Staggered Monolithic Header */}
        <div className="relative z-10 my-auto py-12 md:py-16 max-w-5xl">
          <p 
            className="font-mono text-xs sm:text-sm tracking-[0.25em] text-[#c8a96b] uppercase mb-4 opacity-0 animate-fade-in"
            style={{ animationDelay: "150ms", animationFillMode: "forwards" }}
          >
            [ THE DISCIPLINE OPERATING SYSTEM ]
          </p>

          <h1 
            className="font-serif italic font-normal tracking-tight text-6xl sm:text-8xl md:text-9xl lg:text-[110px] leading-[0.9] text-[#f2f0ea] opacity-0 animate-blur-rise"
            style={{ animationDelay: "250ms", animationFillMode: "forwards" }}
          >
            The Warden
          </h1>

          <p 
            className="mt-6 text-xl sm:text-2xl md:text-3xl font-light text-[#9a9a96] tracking-wide opacity-0 animate-blur-rise"
            style={{ animationDelay: "420ms", animationFillMode: "forwards" }}
          >
            Iron discipline, refined.
          </p>
        </div>

        {/* Bottom Hero Info Block (Asymmetric Placement) */}
        <div className="relative z-10 pb-10 sm:pb-14 flex flex-col md:flex-row items-start md:items-end justify-between gap-8 pt-8 border-t border-[#292c32]/50">
          {/* Bottom Left Paragraph */}
          <div 
            className="max-w-[280px] font-mono text-xs leading-relaxed text-[#9a9a96] opacity-0 animate-slide-up"
            style={{ animationDelay: "700ms", animationFillMode: "forwards" }}
          >
            <p className="border-l border-[#c8a96b]/60 pl-3">
              Every layer of discipline records what you forged under pressure. The Warden holds the ledger.
            </p>
          </div>

          {/* Bottom Right Action Block */}
          <div 
            className="flex flex-col sm:flex-row items-start sm:items-center gap-5 opacity-0 animate-slide-up"
            style={{ animationDelay: "850ms", animationFillMode: "forwards" }}
          >
            <div className="font-mono text-xs text-[#9a9a96] max-w-[240px] text-left md:text-right">
              Precision telemetry. Zero motivational fluff.
            </div>

            <Link
              href="/register"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-md bg-[#e8702a] text-[#0b0c0e] font-semibold text-xs tracking-widest font-mono uppercase hover:scale-[1.03] active:scale-[0.95] transition-transform duration-150 shadow-md shadow-[#e8702a]/10"
            >
              <span>Start Forging</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 3-PILLAR BENTO GRID SECTION ─────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-6 sm:px-12 md:px-16 max-w-7xl mx-auto">
        <div className="mb-16">
          <div className="flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-[#c8a96b] uppercase mb-2">
            <span>PILLARS OF EXECUTION</span>
            <span className="w-12 h-px bg-[#c8a96b]/40" />
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#f2f0ea] tracking-tight">
            Engineered for relentless consistency.
          </h2>
          <p className="text-[#9a9a96] text-sm sm:text-base mt-2 max-w-2xl font-light">
            Designed under strict industrial-brutalist principles. Every module is purpose-built to enforce your commitments without cognitive friction.
          </p>
        </div>

        {/* Bento Grid: Asymmetric 2-column & wide arrangement */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* ── CARD 1: THE IRON RULE (Wide 7 cols) ── */}
          <div 
            id="iron-rule"
            className="lg:col-span-7 bg-[#131519]/90 border border-[#3a3244] rounded-lg p-7 sm:p-9 flex flex-col justify-between hover:border-[#c8a96b]/60 transition-colors duration-200 group"
          >
            <div>
              <div className="flex items-center justify-between font-mono text-[11px] text-[#9a9a96] uppercase tracking-wider mb-6">
                <span className="px-2.5 py-1 rounded bg-[#1a1d22] border border-[#292c32] text-[#c8a96b]">
                  RULE // 01
                </span>
                <span>THRESHOLD: 70%</span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded bg-[#1a1d22] border border-[#3a3244] flex items-center justify-center text-[#c8a96b]">
                  <Flame size={20} />
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#f2f0ea]">
                  The Iron Rule
                </h3>
              </div>

              <p className="text-sm text-[#9a9a96] leading-relaxed mb-8">
                The 70% daily discipline threshold guarantees progress without unrealistic perfectionism. Miss one day and activate a grace buffer. Miss two consecutive days, and your streak burns to zero.
              </p>
            </div>

            {/* Telemetry Mockup Card */}
            <div className="bg-[#0b0c0e] border border-[#292c32] rounded-md p-5 font-mono text-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#292c32] pb-3">
                <span className="text-[#9a9a96]">STREAK STATUS</span>
                <span className="text-[#c8a96b] font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#c8a96b] animate-ping" />
                  14 DAYS ACTIVE
                </span>
              </div>

              {/* Threshold Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-[#9a9a96]">
                  <span>DISCIPLINE TARGET</span>
                  <span className="text-[#7fa889]">4 / 5 COMPLETED (80%)</span>
                </div>
                <div className="w-full h-2 bg-[#1a1d22] rounded-full overflow-hidden flex">
                  <div className="h-full bg-[#c8a96b] rounded-full w-[80%] transition-all duration-500" />
                </div>
                <div className="flex justify-between text-[9px] text-[#62646a]">
                  <span>0%</span>
                  <span className="text-[#c8a96b]">70% THRESHOLD</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Live Commitments Feed */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="bg-[#131519] p-2 rounded border border-[#292c32] flex items-center justify-between">
                  <span className="text-[#9a9a96]">Deep Reading</span>
                  <span className="text-[#7fa889]">45m ✓</span>
                </div>
                <div className="bg-[#131519] p-2 rounded border border-[#292c32] flex items-center justify-between">
                  <span className="text-[#9a9a96]">Technical Lecture</span>
                  <span className="text-[#7fa889]">DONE ✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── CARD 2: FINANCIAL TELEMETRY (5 cols) ── */}
          <div 
            id="financial-telemetry"
            className="lg:col-span-5 bg-[#131519]/90 border border-[#3a3244] rounded-lg p-7 sm:p-9 flex flex-col justify-between hover:border-[#c8a96b]/60 transition-colors duration-200 group"
          >
            <div>
              <div className="flex items-center justify-between font-mono text-[11px] text-[#9a9a96] uppercase tracking-wider mb-6">
                <span className="px-2.5 py-1 rounded bg-[#1a1d22] border border-[#292c32] text-[#c8a96b]">
                  TELEMETRY // 02
                </span>
                <span>AI VISION OCR</span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded bg-[#1a1d22] border border-[#3a3244] flex items-center justify-center text-[#c8a96b]">
                  <Receipt size={20} />
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#f2f0ea]">
                  Financial Telemetry
                </h3>
              </div>

              <p className="text-sm text-[#9a9a96] leading-relaxed mb-6">
                Automated bill photo parsing powered by Claude 3.5 Sonnet Vision. Track monthly burn velocity with dual line and cumulative area burn curves.
              </p>
            </div>

            {/* Financial Telemetry Preview */}
            <div className="bg-[#0b0c0e] border border-[#292c32] rounded-md p-5 font-mono text-xs space-y-3.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#9a9a96]">MTD BURN RATE</span>
                <span className="text-[#f2f0ea] font-semibold">$2,410.00</span>
              </div>

              {/* Sparkline Graphic Mockup */}
              <div className="h-14 w-full bg-[#131519] rounded border border-[#292c32] p-2 flex items-end justify-between gap-1">
                {[20, 35, 25, 45, 30, 60, 50, 75, 40, 85, 65, 95].map((h, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-[#c8a96b]/30 hover:bg-[#c8a96b] rounded-t-xs transition-colors duration-150"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>

              <div className="bg-[#1a1d22] px-2.5 py-1.5 rounded flex items-center justify-between text-[10px] text-[#9a9a96]">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={11} className="text-[#c8a96b]" />
                  Claude OCR Engine
                </span>
                <span className="text-[#7fa889]">AUTO-PARSED</span>
              </div>
            </div>
          </div>

          {/* ── CARD 3: THE READING ROOM (Full 12 cols span) ── */}
          <div 
            id="reading-room"
            className="lg:col-span-12 bg-[#131519]/90 border border-[#3a3244] rounded-lg p-7 sm:p-9 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 hover:border-[#c8a96b]/60 transition-colors duration-200 group"
          >
            <div className="max-w-xl">
              <div className="flex items-center gap-3 font-mono text-[11px] text-[#9a9a96] uppercase tracking-wider mb-4">
                <span className="px-2.5 py-1 rounded bg-[#1a1d22] border border-[#292c32] text-[#c8a96b]">
                  ARCHIVE // 03
                </span>
                <span>CLOUDFLARE R2 SECURE VAULT</span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded bg-[#1a1d22] border border-[#3a3244] flex items-center justify-center text-[#c8a96b]">
                  <BookOpen size={20} />
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#f2f0ea]">
                  The Reading Room
                </h3>
              </div>

              <p className="text-sm text-[#9a9a96] leading-relaxed">
                A sanctuary for deep study. Drag-and-drop any PDF; our server automatically extracts metadata, stores the file in Cloudflare R2, and tracks active reading timers that auto-fulfill your daily reading commitments.
              </p>
            </div>

            {/* Reading Room Session Telemetry Card */}
            <div className="w-full md:w-[380px] bg-[#0b0c0e] border border-[#292c32] rounded-md p-5 font-mono text-xs space-y-3.5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[10px] text-[#c8a96b] tracking-wider uppercase">CURRENT TOME</div>
                  <div className="font-sans text-sm font-semibold text-[#f2f0ea] mt-0.5">Deep Work</div>
                  <div className="text-[10px] text-[#9a9a96]">Cal Newport</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[#9a9a96]">PROGRESS</div>
                  <div className="text-xs text-[#c8a96b] font-semibold">PAGE 142 / 304</div>
                </div>
              </div>

              <div className="w-full h-1.5 bg-[#1a1d22] rounded-full overflow-hidden">
                <div className="h-full bg-[#c8a96b] w-[46.7%]" />
              </div>

              <div className="bg-[#131519] p-3 rounded border border-[#292c32] flex items-center justify-between">
                <div className="flex items-center gap-2 text-stone">
                  <Clock size={14} className="text-[#c8a96b]" />
                  <span className="text-[11px]">ACTIVE SESSION</span>
                </div>
                <span className="text-[#f2f0ea] font-bold">38:45</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── CALL TO ACTION SECTION ──────────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-6 sm:px-12 border-t border-[#292c32] bg-[#0f1115]/50 relative overflow-hidden">
        <div className="max-w-3xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-block px-3 py-1 rounded-full bg-[#1a1d22] border border-[#3a3244] font-mono text-xs text-[#c8a96b] tracking-widest uppercase">
            ACCOUNTABILITY AWAITS
          </div>

          <h2 className="font-serif text-4xl sm:text-6xl text-[#f2f0ea] tracking-tight">
            Ready to build discipline?
          </h2>

          <p className="text-[#9a9a96] text-base sm:text-lg max-w-xl mx-auto font-light leading-relaxed">
            No motivational platitudes. Just cold mathematics, uncompromising telemetry, and daily execution.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-md bg-[#c8a96b] text-[#0b0c0e] font-semibold text-xs tracking-widest font-mono uppercase hover:scale-[1.03] active:scale-[0.98] transition-transform duration-150 shadow-md shadow-[#c8a96b]/10 text-center"
            >
              Get Started
            </Link>
            <Link
              href="/demo"
              className="w-full sm:w-auto px-8 py-3.5 rounded-md border border-[#3a3244] text-[#f2f0ea] font-medium text-xs tracking-widest font-mono uppercase hover:border-[#f2f0ea] hover:scale-[1.03] active:scale-[0.98] transition-all duration-150 text-center"
            >
              See Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#292c32] py-12 px-6 sm:px-12 md:px-16 bg-[#0b0c0e] text-[#9a9a96] text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-xs bg-[#1a1d22] border border-[#3a3244] flex items-center justify-center text-[#c8a96b]">
              <Shield size={13} />
            </div>
            <span className="text-[#f2f0ea] font-serif text-sm tracking-wider uppercase">
              The Warden
            </span>
            <span className="text-[#62646a]">|</span>
            <span className="text-[10px] text-[#62646a]">DISCIPLINE OPERATING SYSTEM</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <Link href="/login" className="hover:text-[#f2f0ea] transition-colors">Login</Link>
            <Link href="/register" className="hover:text-[#f2f0ea] transition-colors">Register</Link>
            <Link href="/demo" className="hover:text-[#f2f0ea] transition-colors">Demo</Link>
            <a 
              href="https://github.com/muheebkamran/The-Warden" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-[#f2f0ea] transition-colors"
            >
              GitHub
            </a>
          </div>

          <div className="text-[10px] text-[#62646a]">
            © 2026 Muheeb Kamran. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
