"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Flame, 
  Wallet, 
  ArrowRight, 
  Menu, 
  X, 
  Shield, 
  Check, 
  Sparkles, 
  TrendingUp,
  Receipt,
  HeartHandshake,
  CalendarCheck
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
                Keep Your Word
              </span>
            </div>
          </Link>
        </div>

        {/* Center Pill Nav (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#131519]/80 border border-[#292c32] shadow-inner text-xs font-medium text-[#9a9a96]">
          <a 
            href="#the-70-rule" 
            className="px-3 py-1 rounded-full hover:text-[#f2f0ea] hover:bg-[#1a1d22] transition-all duration-200"
          >
            The 70% Rule
          </a>
          <a 
            href="#grace-days" 
            className="px-3 py-1 rounded-full hover:text-[#f2f0ea] hover:bg-[#1a1d22] transition-all duration-200"
          >
            Grace Days
          </a>
          <a 
            href="#money" 
            className="px-3 py-1 rounded-full hover:text-[#f2f0ea] hover:bg-[#1a1d22] transition-all duration-200"
          >
            Money &amp; Bills
          </a>
          <a 
            href="#faq" 
            className="px-3 py-1 rounded-full hover:text-[#f2f0ea] hover:bg-[#1a1d22] transition-all duration-200"
          >
            How It Works
          </a>
          <Link 
            href="/demo" 
            className="px-3 py-1 rounded-full hover:text-[#c8a96b] hover:bg-[#1a1d22] transition-all duration-200"
          >
            Demo
          </Link>
        </nav>

        {/* Right CTA Links */}
        <div className="hidden md:flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-xs uppercase tracking-wider font-mono text-[#9a9a96] hover:text-[#f2f0ea] transition-colors duration-200 px-3 py-2 cursor-pointer"
          >
            Log In
          </Link>
          <Link 
            href="/register" 
            className="px-5 py-2 rounded-full bg-[#f2f0ea] text-[#0b0c0e] font-semibold text-xs tracking-wider uppercase hover:bg-[#c8a96b] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 shadow-sm cursor-pointer"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#9a9a96] hover:text-[#f2f0ea] focus:outline-none cursor-pointer"
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
              href="#the-70-rule" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-[#f2f0ea]"
            >
              The 70% Rule
            </a>
            <a 
              href="#grace-days" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-[#f2f0ea]"
            >
              Grace Days
            </a>
            <a 
              href="#money" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-[#f2f0ea]"
            >
              Money &amp; Bills
            </a>
            <a 
              href="#faq" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-[#f2f0ea]"
            >
              How It Works
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
        className="relative min-h-[90vh] md:min-h-screen pt-24 md:pt-28 flex flex-col justify-between px-6 sm:px-12 md:px-16 overflow-hidden cursor-crosshair border-b border-[#292c32]"
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

        {/* Status Header Line */}
        <div className="relative z-10 pt-4 flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] sm:text-xs tracking-widest text-[#9a9a96] uppercase">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#7fa889] animate-pulse" />
            <span>DAILY HABITS &amp; MONEY SYSTEM</span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <span>CONSISTENCY OVER PERFECTION</span>
            <span>NO FLUFF</span>
          </div>
        </div>

        {/* Hero Title & Main Hook */}
        <div className="relative z-10 my-auto py-12 md:py-16 max-w-4xl">
          <p 
            className="font-mono text-xs sm:text-sm tracking-[0.25em] text-[#c8a96b] uppercase mb-4 opacity-0 animate-fade-in"
            style={{ animationDelay: "150ms", animationFillMode: "forwards" }}
          >
            [ PERSONAL DISCIPLINE &amp; ACCOUNTABILITY ]
          </p>

          <h1 
            className="font-serif italic font-normal tracking-tight text-6xl sm:text-8xl md:text-9xl lg:text-[105px] leading-[0.95] text-[#f2f0ea] opacity-0 animate-blur-rise"
            style={{ animationDelay: "250ms", animationFillMode: "forwards" }}
          >
            The Warden
          </h1>

          <p 
            className="mt-6 text-xl sm:text-2xl md:text-3xl font-light text-[#9a9a96] tracking-wide opacity-0 animate-blur-rise"
            style={{ animationDelay: "420ms", animationFillMode: "forwards" }}
          >
            Keep your word every day.
          </p>

          <p 
            className="mt-4 text-sm sm:text-base text-[#9a9a96] max-w-xl font-normal leading-relaxed opacity-0 animate-slide-up"
            style={{ animationDelay: "550ms", animationFillMode: "forwards" }}
          >
            Track your daily habits and bills in a calm, distraction-free space. Complete 70% of your daily habits to keep your streak alive. Miss a day? Your free grace day has your back.
          </p>
        </div>

        {/* Bottom Hero Action Block */}
        <div className="relative z-10 pb-10 sm:pb-14 flex flex-col md:flex-row items-start md:items-end justify-between gap-8 pt-8 border-t border-[#292c32]/50">
          <div 
            className="max-w-[320px] font-mono text-xs leading-relaxed text-[#9a9a96] opacity-0 animate-slide-up"
            style={{ animationDelay: "700ms", animationFillMode: "forwards" }}
          >
            <p className="border-l-2 border-[#c8a96b]/60 pl-3">
              No points, no ads, no fake motivation. Just clear daily proof that you did what you said you would do.
            </p>
          </div>

          <div 
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 opacity-0 animate-slide-up"
            style={{ animationDelay: "850ms", animationFillMode: "forwards" }}
          >
            <Link
              href="/register"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-md bg-[#c8a96b] text-[#0b0c0e] font-semibold text-xs tracking-widest font-mono uppercase hover:scale-[1.03] active:scale-[0.95] transition-transform duration-150 shadow-md shadow-[#c8a96b]/15 cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md border border-[#3a3244] hover:border-[#c8a96b] text-[#f2f0ea] font-medium text-xs tracking-widest font-mono uppercase hover:bg-[#131519] transition-all duration-150 cursor-pointer"
            >
              <span>Explore Demo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 3 CORE PILLARS (Interactive Cards with -8px Hover Lift) ───────── */}
      <section className="py-20 sm:py-28 px-6 sm:px-12 md:px-16 max-w-7xl mx-auto">
        <div className="mb-14">
          <div className="flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-[#c8a96b] uppercase mb-2">
            <span>HOW IT WORKS</span>
            <span className="w-12 h-px bg-[#c8a96b]/40" />
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#f2f0ea] tracking-tight">
            Designed for real consistency.
          </h2>
          <p className="text-[#9a9a96] text-sm sm:text-base mt-2 max-w-2xl font-light">
            Everything in The Warden is built to help you make steady progress without burning out.
          </p>
        </div>

        {/* 3 Interactive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* CARD 1: THE 70% RULE */}
          <div 
            id="the-70-rule"
            className="bg-[#131519]/90 border border-[#3a3244] rounded-xl p-7 flex flex-col justify-between hover:-translate-y-2 hover:border-[#c8a96b]/60 hover:bg-[#1a1d22] transition-all duration-200 group cursor-pointer shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between font-mono text-[10px] text-[#9a9a96] uppercase tracking-wider mb-5">
                <span className="px-2.5 py-1 rounded bg-[#1a1d22] border border-[#292c32] text-[#c8a96b]">
                  RULE // 01
                </span>
                <span>TARGET: 70%</span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#1a1d22] border border-[#3a3244] flex items-center justify-center text-[#c8a96b] group-hover:scale-105 transition-transform">
                  <Flame size={20} />
                </div>
                <h3 className="font-serif text-2xl text-[#f2f0ea]">
                  The 70% Rule
                </h3>
              </div>

              <p className="text-sm text-[#9a9a96] leading-relaxed mb-6 font-sans">
                You don&apos;t have to be 100% perfect every single day. Complete 70% of your daily habits, and your streak keeps climbing. This gives you freedom to succeed even on busy days.
              </p>
            </div>

            {/* Interactive Preview Mockup */}
            <div className="bg-[#0b0c0e] border border-[#292c32] rounded-lg p-4 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#292c32] pb-2">
                <span className="text-[#9a9a96]">YOUR STREAK</span>
                <span className="text-[#c8a96b] font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#c8a96b] animate-pulse" />
                  14 DAYS ACTIVE
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-[#9a9a96]">
                  <span>HABITS DONE</span>
                  <span className="text-[#7fa889]">4 of 5 (80%) ✓</span>
                </div>
                <div className="w-full h-2 bg-[#1a1d22] rounded-full overflow-hidden">
                  <div className="h-full bg-[#7fa889] rounded-full w-[80%]" />
                </div>
                <div className="flex justify-between text-[9px] text-[#62646a]">
                  <span>0%</span>
                  <span className="text-[#c8a96b]">70% THRESHOLD</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: GRACE DAYS */}
          <div 
            id="grace-days"
            className="bg-[#131519]/90 border border-[#3a3244] rounded-xl p-7 flex flex-col justify-between hover:-translate-y-2 hover:border-[#c8a96b]/60 hover:bg-[#1a1d22] transition-all duration-200 group cursor-pointer shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between font-mono text-[10px] text-[#9a9a96] uppercase tracking-wider mb-5">
                <span className="px-2.5 py-1 rounded bg-[#1a1d22] border border-[#292c32] text-[#c8a96b]">
                  PROTECTION // 02
                </span>
                <span>FREE BUFFER</span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#1a1d22] border border-[#3a3244] flex items-center justify-center text-[#c8a96b] group-hover:scale-105 transition-transform">
                  <HeartHandshake size={20} />
                </div>
                <h3 className="font-serif text-2xl text-[#f2f0ea]">
                  Grace Days
                </h3>
              </div>

              <p className="text-sm text-[#9a9a96] leading-relaxed mb-6 font-sans">
                Miss one day? No problem. You get 1 free grace day automatically. A busy day or an illness won&apos;t erase weeks of hard work. Only missing two days in a row resets your streak.
              </p>
            </div>

            {/* Interactive Preview Mockup */}
            <div className="bg-[#0b0c0e] border border-[#292c32] rounded-lg p-4 font-mono text-xs space-y-3">
              <div className="p-2.5 rounded bg-[#c99a54]/10 border border-[#c99a54]/30 text-[#c99a54] text-[11px] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#c99a54] animate-ping" />
                <span>1 Free Grace Day Active</span>
              </div>
              <p className="text-[11px] text-[#9a9a96] font-sans">
                Missed yesterday? Your 14-day streak is protected today. Complete your habits today to keep going!
              </p>
            </div>
          </div>

          {/* CARD 3: MONEY & BILLS */}
          <div 
            id="money"
            className="bg-[#131519]/90 border border-[#3a3244] rounded-xl p-7 flex flex-col justify-between hover:-translate-y-2 hover:border-[#c8a96b]/60 hover:bg-[#1a1d22] transition-all duration-200 group cursor-pointer shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between font-mono text-[10px] text-[#9a9a96] uppercase tracking-wider mb-5">
                <span className="px-2.5 py-1 rounded bg-[#1a1d22] border border-[#292c32] text-[#c8a96b]">
                  FINANCE // 03
                </span>
                <span>MONEY &amp; BILLS</span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#1a1d22] border border-[#3a3244] flex items-center justify-center text-[#c8a96b] group-hover:scale-105 transition-transform">
                  <Wallet size={20} />
                </div>
                <h3 className="font-serif text-2xl text-[#f2f0ea]">
                  Money &amp; Bills
                </h3>
              </div>

              <p className="text-sm text-[#9a9a96] leading-relaxed mb-6 font-sans">
                Track your monthly bills and daily spending in the exact same place. Snap photos of receipts or type them in to see your total savings and spending trends clearly.
              </p>
            </div>

            {/* Interactive Preview Mockup */}
            <div className="bg-[#0b0c0e] border border-[#292c32] rounded-lg p-4 font-mono text-xs space-y-2.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#9a9a96]">TOTAL SAVED THIS MONTH</span>
                <span className="text-emerald-400 font-bold">+$1,090.00</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#9a9a96]">BILLS SETTLED</span>
                <span className="text-[#c8a96b]">3 of 3 Paid ✓</span>
              </div>
              <div className="w-full bg-[#1a1d22] rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full w-[45%]" />
              </div>
              <div className="text-[10px] text-[#62646a] text-right">
                Savings Rate: 45%
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── FAQ / HOW IT WORKS SECTION (Simple Q&A) ───────────────────────── */}
      <section id="faq" className="py-20 sm:py-28 px-6 sm:px-12 md:px-16 max-w-4xl mx-auto border-t border-[#292c32]/60">
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-[#1a1d22] border border-[#3a3244] font-mono text-[10px] text-[#c8a96b] tracking-widest uppercase mb-3">
            QUESTIONS &amp; ANSWERS
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#f2f0ea]">
            Everything you need to know
          </h2>
          <p className="text-[#9a9a96] text-sm mt-2">
            Clear, honest answers. No complicated jargon.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-[#131519]/70 border border-[#292c32] rounded-xl p-6 hover:border-[#3a3244] transition-colors">
            <h3 className="font-serif text-lg text-[#f2f0ea] mb-2">
              What is The Warden?
            </h3>
            <p className="text-[#9a9a96] text-sm leading-relaxed font-sans">
              The Warden is a personal daily tracker designed to help you stay honest with yourself. It combines habit tracking and personal bill tracking into one clean, dark dashboard.
            </p>
          </div>

          <div className="bg-[#131519]/70 border border-[#292c32] rounded-xl p-6 hover:border-[#3a3244] transition-colors">
            <h3 className="font-serif text-lg text-[#f2f0ea] mb-2">
              How does the streak counter work?
            </h3>
            <p className="text-[#9a9a96] text-sm leading-relaxed font-sans">
              Each day you set your habits (like reading for 20 minutes, working out, or drinking water). If you finish at least 70% of them by the end of the day, your streak goes up by 1.
            </p>
          </div>

          <div className="bg-[#131519]/70 border border-[#292c32] rounded-xl p-6 hover:border-[#3a3244] transition-colors">
            <h3 className="font-serif text-lg text-[#f2f0ea] mb-2">
              What happens if I miss a day?
            </h3>
            <p className="text-[#9a9a96] text-sm leading-relaxed font-sans">
              You get one free grace day. That means if you miss yesterday, your streak is still safe today. You just need to show up and complete your habits today. If you miss two days in a row, your streak resets to zero.
            </p>
          </div>

          <div className="bg-[#131519]/70 border border-[#292c32] rounded-xl p-6 hover:border-[#3a3244] transition-colors">
            <h3 className="font-serif text-lg text-[#f2f0ea] mb-2">
              Why is money tracking included with habits?
            </h3>
            <p className="text-[#9a9a96] text-sm leading-relaxed font-sans">
              Discipline isn&apos;t just about morning routines; it&apos;s also about being responsible with your money. Having your monthly bills and daily spending right next to your daily habits gives you a complete view of your life in one place.
            </p>
          </div>
        </div>
      </section>

      {/* ─── CALL TO ACTION SECTION ──────────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-6 sm:px-12 border-t border-[#292c32] bg-[#0f1115]/60 relative overflow-hidden">
        <div className="max-w-3xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-block px-3.5 py-1 rounded-full bg-[#1a1d22] border border-[#3a3244] font-mono text-xs text-[#c8a96b] tracking-widest uppercase">
            START YOUR STREAK
          </div>

          <h2 className="font-serif text-4xl sm:text-6xl text-[#f2f0ea] tracking-tight">
            Ready to build habits that stick?
          </h2>

          <p className="text-[#9a9a96] text-base sm:text-lg max-w-xl mx-auto font-light leading-relaxed">
            No endless notifications. Just a calm, daily system to help you show up and keep your word.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-md bg-[#c8a96b] text-[#0b0c0e] font-semibold text-xs tracking-widest font-mono uppercase hover:scale-[1.03] active:scale-[0.98] transition-transform duration-150 shadow-md shadow-[#c8a96b]/15 text-center cursor-pointer"
            >
              Sign Up Free
            </Link>
            <Link
              href="/demo"
              className="w-full sm:w-auto px-8 py-3.5 rounded-md border border-[#3a3244] text-[#f2f0ea] font-medium text-xs tracking-widest font-mono uppercase hover:border-[#f2f0ea] hover:scale-[1.03] active:scale-[0.98] transition-all duration-150 text-center cursor-pointer"
            >
              See Live Demo
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
            <span className="text-[10px] text-[#62646a]">KEEP YOUR WORD</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <Link href="/login" className="hover:text-[#f2f0ea] transition-colors">Log In</Link>
            <Link href="/register" className="hover:text-[#f2f0ea] transition-colors">Sign Up</Link>
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
            &copy; 2026 The Warden. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
