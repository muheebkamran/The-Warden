"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Flame,
  Lock,
  ArrowRight,
  Menu,
  X,
  Target,
  Sparkles,
  TrendingUp,
  Wallet,
  CheckCircle2,
  Calendar,
  Layers,
  Activity,
  Zap,
  User,
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-[#FFFC00] selection:text-black font-sans antialiased overflow-x-hidden">
      {/* ─── FIXED TOP NAVIGATION BAR ─────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-[#000000]/85 backdrop-blur-2xl border-b border-[#2A2A2E] shadow-[0_4px_24px_rgba(0,0,0,0.8)] px-4 sm:px-8 lg:px-12 flex items-center justify-between">
        {/* Brand Emblem */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-black border border-[#2E2E34] overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(255,252,0,0.25)] group-hover:scale-105 active:scale-95 transition-transform duration-200 shrink-0">
              <img src="/logo.png" alt="The Warden" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-wide text-white uppercase leading-none">
                THE WARDEN
              </span>
              <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-[#FFFC00] font-bold mt-1">
                SOVEREIGN SYSTEM
              </span>
            </div>
          </Link>
        </div>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden xl:flex items-center gap-7 font-mono text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <a
            href="#philosophy"
            className="hover:text-white transition-colors py-1"
          >
            Philosophy
          </a>
          <a
            href="#command-center"
            className="text-[#FFFC00] transition-colors py-1 border-b-2 border-[#FFFC00] font-bold"
          >
            Command Center
          </a>
          <a
            href="#habits"
            className="hover:text-white transition-colors py-1"
          >
            Habits &amp; Consistency
          </a>
          <a
            href="#capital-vault"
            className="hover:text-white transition-colors py-1"
          >
            Capital &amp; Vault
          </a>
          <a
            href="#security"
            className="hover:text-white transition-colors py-1"
          >
            Security
          </a>
        </nav>

        {/* Right CTA Links */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="font-mono text-xs uppercase tracking-widest text-zinc-300 hover:text-white transition-colors px-3 py-2 font-semibold"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="bg-[#FFFC00] text-black font-mono text-xs uppercase font-extrabold tracking-wider px-5 py-2.5 rounded-full hover:bg-white hover:shadow-[0_0_25px_rgba(255,252,0,0.5)] active:scale-[0.98] transition-all flex items-center gap-1.5"
          >
            <span>Get Started</span>
          </Link>
          <Link
            href="/login"
            className="w-8 h-8 rounded-full bg-[#18181C] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:border-[#FFFC00] transition-colors"
            aria-label="User Account"
          >
            <User className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="sm:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-400 hover:text-white focus:outline-none cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-x-0 top-20 z-40 bg-[#0E0E10]/95 backdrop-blur-2xl border-b border-[#2A2A2E] p-6 space-y-4 animate-fade-in">
          <nav className="flex flex-col space-y-3 font-mono text-xs uppercase tracking-wider text-zinc-400">
            <a
              href="#command-center"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-white"
            >
              Command Center
            </a>
            <a
              href="#habits"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-white"
            >
              Habit Architecture
            </a>
            <a
              href="#capital-vault"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-white"
            >
              Capital &amp; Vault
            </a>
            <a
              href="#philosophy"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-white"
            >
              Philosophy
            </a>
            <Link
              href="/demo"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-[#FFFC00]"
            >
              Live Demo
            </Link>
          </nav>
          <div className="pt-4 border-t border-[#2A2A2E] flex flex-col gap-3">
            <Link
              href="/login"
              className="w-full text-center py-2.5 rounded-xl border border-[#2A2A2E] text-xs font-mono tracking-wider uppercase text-white hover:border-[#FFFC00]"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="w-full text-center py-2.5 rounded-xl bg-[#FFFC00] text-black font-extrabold text-xs font-mono tracking-wider uppercase hover:bg-white"
            >
              Initialize The Warden
            </Link>
          </div>
        </div>
      )}

      {/* ─── HERO SECTION: THE SOVEREIGN OPERATING ENVIRONMENT ────────────── */}
      <section className="relative w-full overflow-hidden bg-[#000000] pt-32 pb-20 sm:pt-36 sm:pb-24">
        {/* Atmospheric Ambient Glows */}
        <div
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#FFFC00]/[0.08] rounded-full blur-[160px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-48 left-1/4 w-[400px] h-[400px] bg-[#0096FF]/[0.05] rounded-full blur-[140px]"
          aria-hidden="true"
        />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 flex flex-col items-center">
          {/* Sovereign Runtime Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white shadow-xl mb-6">
            <div className="w-5 h-5 rounded-full bg-[#18181C] border border-[#2E2E34] flex items-center justify-center text-[#FFFC00]">
              <Zap className="w-3 h-3 fill-current" />
            </div>
            <span className="font-mono text-[11px] uppercase text-[#FFFC00] tracking-[0.2em] font-extrabold">
              SOVEREIGN RUNTIME v4.2
            </span>
            <span className="text-zinc-600">|</span>
            <span className="font-mono text-[11px] text-zinc-300 tracking-wider font-semibold">
              NODE STATE: ARMED
            </span>
          </div>

          {/* Main Headline (Matching Screenshot 6) */}
          <div className="text-center max-w-4xl flex flex-col items-center gap-4">
            <h1 className="font-sans text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[1.05]">
              THE OPERATING ENVIRONMENT<br />
              FOR <span className="text-[#FFFC00] drop-shadow-[0_0_30px_rgba(255,252,0,0.5)]">UNCOMPROMISING</span><br />
              <span className="text-[#FFFC00] drop-shadow-[0_0_30px_rgba(255,252,0,0.5)]">DISCIPLINE</span> &amp; SOVEREIGN<br />
              CAPITAL.
            </h1>
            <p className="font-sans text-base sm:text-lg text-zinc-300 max-w-2xl leading-relaxed font-normal mt-2">
              A unified command center engineered to eliminate friction, enforce daily consistency, and protect financial sovereignty. Not another habit tracker. Your personal fortress.
            </p>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link
              href="/register"
              className="bg-[#FFFC00] text-black font-mono text-xs uppercase font-extrabold tracking-wider px-8 py-3.5 rounded-full hover:bg-white hover:shadow-[0_0_30px_rgba(255,252,0,0.6)] active:scale-[0.98] transition-all shadow-xl flex items-center gap-2 cursor-pointer"
            >
              <span>Initialize The Warden</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/demo"
              className="bg-[#121214] border border-[#2A2A2E] text-zinc-300 hover:text-white hover:border-[#FFFC00] font-mono text-xs uppercase font-bold tracking-wider px-7 py-3.5 rounded-full active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Architecture</span>
              <span className="text-[#FFFC00]">→</span>
            </Link>
          </div>

          {/* ─── INTERFACE CENTERPIECE COMPOSITION ────────────────────────── */}
          <div className="w-full max-w-5xl mt-14 relative">
            <div className="bg-[#101012] border border-[#2A2A2E] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-5 sm:p-7 relative overflow-hidden">
              {/* Highlight Glow Edge */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFFC00] to-transparent opacity-80" />

              {/* Command Bar Top Header */}
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#2A2A2E] gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFFC00] shadow-[0_0_8px_#FFFC00]" />
                    <span className="font-mono text-[11px] text-white uppercase tracking-wider font-extrabold">
                      DEFENSE MATRIX // ACTIVE
                    </span>
                  </div>
                  <span className="text-zinc-700 hidden sm:inline">|</span>
                  <span className="font-mono text-[11px] text-zinc-400 tracking-widest hidden sm:inline">
                    CYCLE 089 // Q1 HORIZON
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-[#FFFC00] tracking-widest uppercase font-bold hidden md:inline">
                    AIR-GAPPED LOCAL ENCRYPTION
                  </span>
                  <span className="px-2.5 py-1 bg-[#1C1C20] rounded-full font-mono text-[10px] text-[#0096FF] border border-[#0096FF]/40 font-bold uppercase tracking-wider">
                    TIER-1 SOVEREIGN
                  </span>
                </div>
              </div>

              {/* Triple Telemetry Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5">
                {/* Metric 01: Adherence Floor */}
                <div className="bg-[#151518] p-4 sm:p-5 rounded-xl border border-[#2A2A2E] flex flex-col justify-between hover:border-[#FFFC00]/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[11px] text-zinc-400 uppercase tracking-wider font-bold">
                      Daily Adherence Floor
                    </span>
                    <Shield className="w-4 h-4 text-[#FFFC00]" />
                  </div>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-1">
                      <span className="font-sans text-3xl sm:text-4xl text-white font-extrabold tracking-tight">
                        91.4
                      </span>
                      <span className="font-sans text-xl text-[#FFFC00] font-black">%</span>
                    </div>
                    <div className="w-full bg-[#202024] h-2 rounded-full mt-2.5 overflow-hidden">
                      <div
                        className="bg-[#FFFC00] h-full rounded-full shadow-[0_0_10px_#FFFC00]"
                        style={{ width: "91.4%" }}
                      />
                    </div>
                    <div className="flex justify-between text-zinc-400 mt-2 font-mono text-[10px] font-bold">
                      <span>SYSTEM MIN 85.0%</span>
                      <span className="text-[#0096FF] font-semibold">+6.4% SURPLUS</span>
                    </div>
                  </div>
                </div>

                {/* Metric 02: Active Defense Streak */}
                <div className="bg-[#151518] p-4 sm:p-5 rounded-xl border border-[#2A2A2E] flex flex-col justify-between hover:border-[#FF7A00]/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[11px] text-zinc-400 uppercase tracking-wider font-bold">
                      Active Defense Streak
                    </span>
                    <Flame className="w-4 h-4 text-[#FF7A00]" />
                  </div>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-sans text-3xl sm:text-4xl text-white font-extrabold tracking-tight">
                        42
                      </span>
                      <span className="font-mono text-sm text-[#FF7A00] font-black">DAYS 🔥</span>
                    </div>
                    <div className="w-full bg-[#202024] h-2 rounded-full mt-2.5 overflow-hidden">
                      <div
                        className="bg-[#FF7A00] h-full rounded-full shadow-[0_0_10px_#FF7A00]"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div className="flex justify-between text-zinc-400 mt-2 font-mono text-[10px] font-bold">
                      <span>UNBROKEN CADENCE</span>
                      <span className="text-[#FFFC00]">ZERO VIOLATIONS</span>
                    </div>
                  </div>
                </div>

                {/* Metric 03: Capital Allocation */}
                <div className="bg-[#151518] p-4 sm:p-5 rounded-xl border border-[#2A2A2E] flex flex-col justify-between hover:border-[#0096FF]/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[11px] text-zinc-400 uppercase tracking-wider font-bold">
                      Capital Allocation
                    </span>
                    <Lock className="w-4 h-4 text-[#0096FF]" />
                  </div>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-lg text-white font-bold">$</span>
                      <span className="font-sans text-3xl sm:text-4xl text-white font-extrabold tracking-tight">
                        14,250
                      </span>
                    </div>
                    <div className="w-full bg-[#202024] h-2 rounded-full mt-2.5 overflow-hidden">
                      <div
                        className="bg-[#0096FF] h-full rounded-full shadow-[0_0_10px_#0096FF]"
                        style={{ width: "84%" }}
                      />
                    </div>
                    <div className="flex justify-between text-zinc-400 mt-2 font-mono text-[10px] font-bold">
                      <span>SECURED LIQUIDITY</span>
                      <span className="text-[#9A38FF] font-semibold">IMPULSE COOLDOWN ACTIVE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Logbook Stream Preview */}
              <div className="bg-[#151518] border border-[#2A2A2E] rounded-xl p-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#2A2A2E] mb-3">
                  <span className="font-mono text-[11px] text-zinc-400 uppercase tracking-widest font-bold">
                    Immutable Daily Protocol // Live Ledger
                  </span>
                  <span className="font-mono text-[11px] text-[#FFFC00] tracking-widest font-extrabold">
                    07:00 TO 22:00 UTC
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div className="p-3 bg-[#0E0E10] rounded-lg border border-[#2A2A2E] flex items-center justify-between hover:border-[#0096FF]/40 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#0096FF] shadow-[0_0_6px_#0096FF]" />
                      <div>
                        <div className="text-xs text-white font-bold">Deep Work: Architecture Spec</div>
                        <div className="font-mono text-[10px] text-zinc-400">08:00 - 10:00 // LOCKED</div>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-[#0096FF] font-black px-2 py-0.5 rounded bg-[#0096FF]/10">
                      100%
                    </span>
                  </div>

                  <div className="p-3 bg-[#0E0E10] rounded-lg border border-[#2A2A2E] flex items-center justify-between hover:border-[#9A38FF]/40 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#9A38FF] shadow-[0_0_6px_#9A38FF]" />
                      <div>
                        <div className="text-xs text-white font-bold">Calisthenics &amp; Physiological Reset</div>
                        <div className="font-mono text-[10px] text-zinc-400">12:30 - 13:15 // VERIFIED</div>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-[#9A38FF] font-black px-2 py-0.5 rounded bg-[#9A38FF]/10">
                      100%
                    </span>
                  </div>

                  <div className="p-3 bg-[#0E0E10] rounded-lg border border-[#00D664]/40 bg-[#00D664]/[0.03] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#00D664] animate-ping" />
                      <div>
                        <div className="text-xs text-white font-bold">Capital Vault Reconciliation</div>
                        <div className="font-mono text-[10px] text-zinc-400 font-bold">20:00 - 20:30 // IN PROGRESS</div>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-black font-black px-2 py-0.5 rounded bg-[#00D664]">
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>

              {/* Chassis Footer Status */}
              <div className="flex flex-wrap items-center justify-between pt-3.5 border-t border-[#2A2A2E] mt-4 gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-zinc-500">HASH: 9e88b...32fc</span>
                  <span className="font-mono text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    ZERO TELEMETRY LEAKAGE
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FFFC00] shadow-[0_0_8px_#FFFC00]" />
                  <span className="font-mono text-[10px] text-white uppercase tracking-widest font-extrabold">
                    Sovereign State Protected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 01: THE COMMAND CENTER (3 PROTOCOLS BENTO) ───────────── */}
      <section id="command-center" className="w-full bg-[#08080A] py-20 sm:py-28 border-t border-[#2A2A2E]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#2A2A2E]">
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-black/60 border border-white/10 mb-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#FFFC00] font-black">
                  01 // COMMAND CENTER
                </span>
              </div>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl text-white font-black uppercase tracking-tight">
                A Quiet Mind Through Systematic Control.
              </h2>
            </div>
            <p className="font-sans text-sm sm:text-base text-zinc-300 max-w-md leading-relaxed">
              Eliminate decision fatigue and daily ambiguity. The Warden replaces open-ended task anxiety with linear, immutable operational certainty.
            </p>
          </div>

          {/* 3 Bento Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
            {/* Protocol 01 */}
            <div className="bg-[#121214] p-7 rounded-2xl border border-[#2A2A2E] flex flex-col justify-between hover:border-[#0096FF] transition-all group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-[11px] text-[#0096FF] uppercase tracking-widest font-extrabold">
                    PROTOCOL 01
                  </span>
                  <div className="w-9 h-9 rounded-full bg-[#1C1C20] flex items-center justify-center text-[#0096FF] group-hover:bg-[#0096FF] group-hover:text-black transition-colors">
                    <Target className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-sans text-xl text-white font-bold mb-3 tracking-tight">
                  Frictionless Triage
                </h3>
                <p className="font-sans text-sm text-zinc-400 leading-relaxed">
                  Never stare at an endless backlog. Daily responsibilities are quarantined to the active 24-hour cycle. If it does not matter today, it does not exist in your visual field.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#2A2A2E] font-mono text-[11px]">
                <div className="flex justify-between py-1 text-zinc-400">
                  <span className="font-bold">VISUAL POLLUTION</span>
                  <span className="text-[#FF2D55] font-extrabold">REDUCED TO ZERO</span>
                </div>
                <div className="flex justify-between py-1 text-zinc-400">
                  <span className="font-bold">ACTIVE CAPACITY</span>
                  <span className="text-white font-extrabold">MAX 4 CORE DIRECTIVES</span>
                </div>
              </div>
            </div>

            {/* Protocol 02 */}
            <div className="bg-[#121214] p-7 rounded-2xl border border-[#2A2A2E] flex flex-col justify-between hover:border-[#FFFC00] transition-all group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-[11px] text-[#FFFC00] uppercase tracking-widest font-extrabold">
                    PROTOCOL 02
                  </span>
                  <div className="w-9 h-9 rounded-full bg-[#1C1C20] flex items-center justify-center text-[#FFFC00] group-hover:bg-[#FFFC00] group-hover:text-black transition-colors">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-sans text-xl text-white font-bold mb-3 tracking-tight">
                  The Commitment Gate
                </h3>
                <p className="font-sans text-sm text-zinc-400 leading-relaxed">
                  Every morning at first boot, you negotiate terms with yourself. Once committed, directives lock into the ledger. No spontaneous goal shifting when afternoon discipline wavers.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#2A2A2E] font-mono text-[11px]">
                <div className="flex justify-between py-1 text-zinc-400">
                  <span className="font-bold">LEDGER STATE</span>
                  <span className="text-[#FFFC00] font-extrabold">IMMUTABLE PROTOCOL</span>
                </div>
                <div className="flex justify-between py-1 text-zinc-400">
                  <span className="font-bold">EVALUATION THRESHOLD</span>
                  <span className="text-[#00D664] font-extrabold">70% SYSTEM FLOOR</span>
                </div>
              </div>
            </div>

            {/* Protocol 03 */}
            <div className="bg-[#121214] p-7 rounded-2xl border border-[#2A2A2E] flex flex-col justify-between hover:border-[#9A38FF] transition-all group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-[11px] text-[#9A38FF] uppercase tracking-widest font-extrabold">
                    PROTOCOL 03
                  </span>
                  <div className="w-9 h-9 rounded-full bg-[#1C1C20] flex items-center justify-center text-[#9A38FF] group-hover:bg-[#9A38FF] group-hover:text-black transition-colors">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-sans text-xl text-white font-bold mb-3 tracking-tight">
                  Evening Reconciliation
                </h3>
                <p className="font-sans text-sm text-zinc-400 leading-relaxed">
                  Before your terminal goes dark, execute the reconciliation ceremony. Binary evaluation: executed or neglected. No vague partial points. Sleep with absolute peace of mind.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#2A2A2E] font-mono text-[11px]">
                <div className="flex justify-between py-1 text-zinc-400">
                  <span className="font-bold">EVALUATION LOGIC</span>
                  <span className="text-white font-extrabold">STRICT BOOLEAN</span>
                </div>
                <div className="flex justify-between py-1 text-zinc-400">
                  <span className="font-bold">CLOSING STATUS</span>
                  <span className="text-[#9A38FF] font-extrabold">SOVEREIGN CLOSURE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 02: HABITS & CONSISTENCY (MOMENTUM OVER MOTIVATION) ───── */}
      <section id="habits" className="w-full bg-[#000000] py-20 sm:py-28 border-t border-[#2A2A2E]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Editorial */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-black/60 border border-white/10 mb-3">
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#FF7A00] font-black">
                    02 // HABIT ARCHITECTURE
                  </span>
                </div>
                <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl text-white font-black leading-tight uppercase">
                  Momentum Over Motivation.
                </h2>
                <p className="font-sans text-base text-zinc-300 mt-4 leading-relaxed">
                  Motivation is volatile chemical noise. Systems are immutable physical laws. The Warden measures your devotion by the height of your baseline floor, not the peak of your best days.
                </p>
                <p className="font-sans text-sm text-zinc-400 mt-3 leading-relaxed">
                  Gamified software pacifies users with confetti animations and artificial dopamine loops. We provide clean, mathematical proof of personal sovereignty.
                </p>
              </div>

              <div className="mt-8 p-5 bg-[#121214] rounded-xl border border-[#2A2A2E] hover:border-[#FF7A00] transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-4 h-4 text-[#FF7A00]" />
                  <span className="font-mono text-xs text-white uppercase tracking-wider font-extrabold">
                    The 70% Defense Doctrine
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  An unbroken streak at 70% intensity outweighs sporadic 100% bursts followed by collapse. Complete 70% of daily habits, and your streak never falters. Miss a day? Your free Grace Day protects you.
                </p>
              </div>
            </div>

            {/* Right Telemetry Cards */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Habit Card 01 */}
              <div className="bg-[#121214] p-5 rounded-xl border border-[#2A2A2E] hover:border-[#FFFC00] transition-all">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 bg-[#1A1A1E] rounded-xl border border-[#2A2A2E] flex items-center justify-center text-[#FFFC00]">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-sans text-base text-white font-bold">Deep Work: Architecture Spec</h4>
                      <span className="font-mono text-[10px] text-zinc-400 tracking-wider uppercase font-semibold">
                        ANCHOR DISCIPLINE // MORNING PHASE
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-sans text-xl text-[#FFFC00] font-black">
                      42 <span className="font-mono text-xs text-zinc-400 font-normal">DAYS</span>
                    </span>
                    <span className="font-mono text-[10px] text-[#0096FF] block tracking-wider uppercase font-bold">
                      UNBROKEN CADENCE 🔥
                    </span>
                  </div>
                </div>
                {/* 28-day cell bar */}
                <div className="mt-4 pt-3 border-t border-[#2A2A2E]">
                  <div className="flex justify-between items-center mb-1.5 font-mono text-[10px]">
                    <span className="text-zinc-400 uppercase tracking-widest font-bold">
                      Cycle Velocity (Last 28 Days)
                    </span>
                    <span className="text-[#FFFC00] uppercase font-extrabold">100% RETENTION</span>
                  </div>
                  <div className="grid grid-cols-28 gap-1 w-full h-2.5">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <span
                        key={i}
                        className="h-2.5 rounded-xs bg-[#FFFC00] shadow-[0_0_4px_#FFFC00]"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Habit Card 02 */}
              <div className="bg-[#121214] p-5 rounded-xl border border-[#2A2A2E] hover:border-[#0096FF] transition-all">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 bg-[#1A1A1E] rounded-xl border border-[#2A2A2E] flex items-center justify-center text-[#0096FF]">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-sans text-base text-white font-bold">Calisthenics &amp; Mobility Cadence</h4>
                      <span className="font-mono text-[10px] text-zinc-400 tracking-wider uppercase font-semibold">
                        PHYSIOLOGICAL RESET // NOON PHASE
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-sans text-xl text-[#0096FF] font-black">
                      28 <span className="font-mono text-xs text-zinc-400 font-normal">DAYS</span>
                    </span>
                    <span className="font-mono text-[10px] text-[#0096FF] block tracking-wider uppercase font-bold">
                      UNBROKEN DEFENSE
                    </span>
                  </div>
                </div>
                {/* 28-day cell bar */}
                <div className="mt-4 pt-3 border-t border-[#2A2A2E]">
                  <div className="flex justify-between items-center mb-1.5 font-mono text-[10px]">
                    <span className="text-zinc-400 uppercase tracking-widest font-bold">
                      Cycle Velocity (Last 28 Days)
                    </span>
                    <span className="text-[#0096FF] uppercase font-extrabold">96.4% RETENTION</span>
                  </div>
                  <div className="grid grid-cols-28 gap-1 w-full h-2.5">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <span
                        key={i}
                        className={`h-2.5 rounded-xs ${
                          i === 12 ? "bg-[#2A2A2E]" : "bg-[#0096FF]"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Habit Card 03 */}
              <div className="bg-[#121214] p-5 rounded-xl border border-[#2A2A2E] hover:border-[#9A38FF] transition-all">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 bg-[#1A1A1E] rounded-xl border border-[#2A2A2E] flex items-center justify-center text-[#9A38FF]">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-sans text-base text-white font-bold">Primary Text Exegesis</h4>
                      <span className="font-mono text-[10px] text-zinc-400 tracking-wider uppercase font-semibold">
                        COGNITIVE FORTRESS // EVENING PHASE
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-sans text-xl text-[#9A38FF] font-black">
                      35 <span className="font-mono text-xs text-zinc-400 font-normal">DAYS</span>
                    </span>
                    <span className="font-mono text-[10px] text-[#9A38FF] block tracking-wider uppercase font-bold">
                      UNBROKEN DEFENSE
                    </span>
                  </div>
                </div>
                {/* 28-day cell bar */}
                <div className="mt-4 pt-3 border-t border-[#2A2A2E]">
                  <div className="flex justify-between items-center mb-1.5 font-mono text-[10px]">
                    <span className="text-zinc-400 uppercase tracking-widest font-bold">
                      Cycle Velocity (Last 28 Days)
                    </span>
                    <span className="text-[#9A38FF] uppercase font-extrabold">100% RETENTION</span>
                  </div>
                  <div className="grid grid-cols-28 gap-1 w-full h-2.5">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <span
                        key={i}
                        className="h-2.5 rounded-xs bg-[#9A38FF]"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 03: CAPITAL & THE IMPULSE VAULT ──────────────────────── */}
      <section id="capital-vault" className="w-full bg-[#08080A] py-20 sm:py-28 border-t border-[#2A2A2E]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#2A2A2E]">
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-black/60 border border-white/10 mb-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#00D664] font-black">
                  03 // CAPITAL SOVEREIGNTY
                </span>
              </div>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl text-white font-black uppercase tracking-tight">
                Discipline Without Capital Is Incomplete.
              </h2>
            </div>
            <p className="font-sans text-sm sm:text-base text-zinc-300 max-w-md leading-relaxed">
              True personal sovereignty requires defending both your attention and your net surplus. Track bills, scan receipts with OCR, and defeat emotional spending.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {/* Feature 1: The 48-Hour Impulse Shield */}
            <div className="bg-[#121214] p-7 rounded-2xl border border-[#2A2A2E] flex flex-col justify-between hover:border-[#00D664] transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#00D664]/10 border border-[#00D664]/30 flex items-center justify-center text-[#00D664] mb-5">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-sans text-xl text-white font-bold mb-2.5">
                  The Impulse Purchase Shield
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Lock non-essential purchases into the cooling vault for 48 hours. When dopamine resets to baseline, 82% of impulsive desires vanish voluntarily.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#2A2A2E] font-mono text-[11px] flex justify-between text-zinc-400">
                <span>DOPAMINE COOLING</span>
                <span className="text-[#00D664] font-bold">48-HOUR DELAY</span>
              </div>
            </div>

            {/* Feature 2: Bill OCR Scanner */}
            <div className="bg-[#121214] p-7 rounded-2xl border border-[#2A2A2E] flex flex-col justify-between hover:border-[#FFFC00] transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#FFFC00]/10 border border-[#FFFC00]/30 flex items-center justify-center text-[#FFFC00] mb-5">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="font-sans text-xl text-white font-bold mb-2.5">
                  Instant Bill &amp; Receipt OCR
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Snap a photo of any receipt, utility invoice, or rent document. Built-in OCR parses amount, vendor, and due dates directly into your ledger.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#2A2A2E] font-mono text-[11px] flex justify-between text-zinc-400">
                <span>CAMERA PARSING</span>
                <span className="text-[#FFFC00] font-bold">INSTANT TELEMETRY</span>
              </div>
            </div>

            {/* Feature 3: Financial Fortress Runway */}
            <div className="bg-[#121214] p-7 rounded-2xl border border-[#2A2A2E] flex flex-col justify-between hover:border-[#0096FF] transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#0096FF]/10 border border-[#0096FF]/30 flex items-center justify-center text-[#0096FF] mb-5">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-sans text-xl text-white font-bold mb-2.5">
                  Sovereign Savings Runway
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Establish 3-to-6 month emergency buffers and sovereign capital targets. Turn economic volatility and unexpected costs into minor inconveniences.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#2A2A2E] font-mono text-[11px] flex justify-between text-zinc-400">
                <span>DEFENSE RUNWAY</span>
                <span className="text-[#0096FF] font-bold">3–6 MONTHS BUFFER</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 04: PHILOSOPHY & FAQ ─────────────────────────────────── */}
      <section id="philosophy" className="py-20 sm:py-28 px-4 sm:px-8 lg:px-12 max-w-4xl mx-auto border-t border-[#2A2A2E]">
        <div className="text-center mb-14">
          <div className="inline-block px-3.5 py-1 rounded-full bg-[#18181B] border border-[#2A2A2E] font-mono text-[11px] text-[#FFFC00] tracking-widest uppercase mb-3 font-bold">
            DOCTRINE &amp; PROTOCOL
          </div>
          <h2 className="font-sans text-3xl sm:text-4xl text-white font-black tracking-tight">
            Frequently Examined Concepts
          </h2>
          <p className="text-zinc-400 text-sm mt-2">
            Clear, honest operational answers. Zero artificial gamification.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-[#121214] border border-[#2A2A2E] rounded-xl p-6 hover:border-[#3E3E46] transition-colors">
            <h3 className="text-base font-bold text-white mb-2">
              Why 70% instead of 100% perfection?
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Perfectionism is the primary catalyst for total habit abandonment. The &quot;all-or-nothing&quot; cognitive distortion causes individuals who miss 1 out of 5 habits to abandon all 5. By defining 70% as the success floor, you cultivate resilient consistency that survives real-world chaos.
            </p>
          </div>

          <div className="bg-[#121214] border border-[#2A2A2E] rounded-xl p-6 hover:border-[#3E3E46] transition-colors">
            <h3 className="text-base font-bold text-white mb-2">
              How does the automatic Grace Day protect streaks?
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              If life delivers an acute disruption and you complete zero habits on Tuesday, your streak is not wiped. You receive 1 free Grace Day automatically. Only two consecutive days of missed adherence resets your streak counter to zero.
            </p>
          </div>

          <div className="bg-[#121214] border border-[#2A2A2E] rounded-xl p-6 hover:border-[#3E3E46] transition-colors">
            <h3 className="text-base font-bold text-white mb-2">
              Why are habits and capital housed in the same command center?
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Discipline is not compartmentalized. A human who executes morning routines but leaks capital through undisciplined impulse spending remains fragile. Aligning daily habits alongside monthly bills and discretionary outflows enforces total personal integrity.
            </p>
          </div>
        </div>
      </section>

      {/* ─── CALL TO ACTION SECTION ──────────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-4 sm:px-8 border-t border-[#2A2A2E] bg-gradient-to-b from-[#0E0E10] to-[#000000] relative overflow-hidden text-center">
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#FFFC00]/10 border border-[#FFFC00]/30 font-mono text-xs text-[#FFFC00] tracking-widest uppercase font-extrabold">
            SOVEREIGN ACTIVATION
          </div>

          <h2 className="font-sans text-4xl sm:text-6xl text-white font-black tracking-tight leading-tight uppercase">
            Ready to Defend Your Word?
          </h2>

          <p className="text-zinc-300 text-base sm:text-lg max-w-xl mx-auto font-normal leading-relaxed">
            No advertisements. No social vanity metrics. Just mathematical telemetry and sovereign peace of mind.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-9 py-4 rounded-full bg-[#FFFC00] text-black font-mono font-extrabold text-xs tracking-widest uppercase hover:bg-white hover:shadow-[0_0_30px_rgba(255,252,0,0.5)] active:scale-[0.98] transition-all shadow-xl text-center cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Initialize The Warden</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/demo"
              className="w-full sm:w-auto px-8 py-4 rounded-full border border-[#2A2A2E] hover:border-white text-white font-mono font-bold text-xs tracking-widest uppercase hover:bg-[#18181B] active:scale-[0.98] transition-all text-center cursor-pointer"
            >
              Explore Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#2A2A2E] py-12 px-4 sm:px-8 lg:px-12 bg-[#000000] text-zinc-400 text-xs font-mono">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-black border border-[#2E2E34] overflow-hidden flex items-center justify-center shadow-sm shrink-0">
              <img src="/logo.png" alt="The Warden" className="w-full h-full object-contain" />
            </div>
            <span className="text-white font-bold text-sm tracking-wider uppercase">
              The Warden
            </span>
            <span className="text-zinc-700">|</span>
            <span className="text-[11px] text-[#FFFC00] font-bold">DISCIPLINE &amp; CAPITAL</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px]">
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
            <Link href="/demo" className="hover:text-white transition-colors">Demo</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <a
              href="https://github.com/muheebkamran/The-Warden"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>

          <div className="text-[11px] text-zinc-600">
            &copy; 2026 The Warden. Sovereign Architecture.
          </div>
        </div>
      </footer>
    </div>
  );
}
