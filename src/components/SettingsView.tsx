"use client";

import React, { useState, useTransition, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  updateUserSettings,
  exportUserData,
  resetStreakAction,
  deleteMyData,
} from "@/app/actions";
import { ThemeSelector } from "@/components/settings/ThemeSelector";
import { AvatarUpload } from "@/components/settings/AvatarUpload";
import {
  Shield,
  CheckCircle2,
  Lock,
  Download,
  AlertTriangle,
  RotateCcw,
  Smartphone,
  Info,
  Save,
  Check,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface User {
  id: string;
  email?: string | null;
  timezone?: string | null;
  preferredTheme?: string | null;
  avatarUrl?: string | null;
  createdAt: Date;
}

interface StreakState {
  currentStreak: number;
  longestStreak: number;
}

interface SettingsViewProps {
  user: User;
  streakState: StreakState | null;
}

export function SettingsView({ user }: SettingsViewProps) {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState(user.email || "");
  const [timezone, setTimezone] = useState(user.timezone || "UTC");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const sections = gsap.utils.toArray(
        containerRef.current.querySelectorAll(".settings-section")
      );
      if (sections.length === 0) return;

      gsap.fromTo(
        sections,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: "power2.out" }
      );
    },
    { scope: containerRef }
  );

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("email", email);
    formData.append("timezone", timezone);
    startTransition(async () => {
      await updateUserSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    });
  };

  const handleExport = () => {
    startTransition(async () => {
      const data = await exportUserData();
      if (data) {
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `warden-vault-export-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    });
  };

  const handleResetStreak = () => {
    startTransition(() => {
      resetStreakAction();
      setResetModalOpen(false);
    });
  };

  const handleDeleteData = () => {
    if (deleteConfirmText === "DELETE") {
      startTransition(() => {
        deleteMyData();
        setDeleteModalOpen(false);
        setDeleteConfirmText("");
      });
    }
  };

  const shortAccountId = `WRD-${user.id.slice(0, 8).toUpperCase()}`;

  return (
    <div
      className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-24"
      ref={containerRef}
    >
      {/* ─── HEADER & SYSTEM STATUS METADATA (STITCH DESIGN) ──────────────── */}
      <section className="settings-section flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4 border-b border-white/[0.08]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#FFFC00] shadow-[0_0_8px_#FFFC00]" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#8E8E93] font-semibold">
              SYSTEM CONTROL // SOVEREIGN RUNTIME V4.2
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#1C1C20] border border-white/[0.08] font-mono text-[10px] text-[#FFFC00] font-bold">
              AIR-GAPPED VAULT
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Settings &amp; System Control
          </h1>
          <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
            Manage operator identity, credential synchronization, visual themes, data backups, and high-friction security gates.
          </p>
        </div>

        {/* Live Vault Status Micro-Telemetry Card */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[#141416] border border-white/[0.08] rounded-2xl self-start lg:self-auto shadow-sm">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
              Vault Perimeter
            </span>
            <span className="font-mono text-xs font-bold text-[#FFFC00]">
              ENCRYPTED // ACTIVE
            </span>
          </div>
          <div className="w-px h-7 bg-white/[0.08]" />
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
              Storage Node
            </span>
            <span className="font-mono text-xs font-bold text-white">
              #LOCAL-ENCLAVE
            </span>
          </div>
          <div className="w-px h-7 bg-white/[0.08]" />
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
              Clearance
            </span>
            <span className="font-mono text-xs font-bold text-[#00D664]">
              ● SOVEREIGN TIER
            </span>
          </div>
        </div>
      </section>

      {/* Dynamic Success Feedback Toast */}
      {saveSuccess && (
        <div className="p-4 bg-[#141416] border border-[#00D664]/50 rounded-2xl flex items-center justify-between gap-4 shadow-lg shadow-[#00D664]/5 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#00D664]/10 text-[#00D664] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white tracking-wide">
                ✓ Account settings successfully synchronized
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                Changes committed to sovereign enclave database.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─── SECTION 01 & 02: ACCOUNT DETAILS & AVATAR ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Section 01: Account Details (7 Cols) */}
        <section className="settings-section lg:col-span-7 flex flex-col gap-6 bg-[#141416] border border-white/[0.08] p-6 rounded-2xl relative">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1C1C20] border border-white/[0.08] flex items-center justify-center text-[#FFFC00]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#FFFC00] font-bold">
                  Section 01
                </span>
                <h2 className="text-lg font-bold text-white leading-tight">
                  Account &amp; Profile
                </h2>
              </div>
            </div>
            <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#1C1C20] border border-white/[0.08] text-zinc-300">
              Verified
            </span>
          </div>

          {/* Read-Only Telemetry Metadata Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#18181B] border border-white/[0.06] rounded-xl font-mono">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                Operator ID
              </span>
              <span className="text-xs font-bold text-white mt-0.5">
                {shortAccountId}
              </span>
            </div>
            <div className="flex flex-col border-t sm:border-t-0 sm:border-l border-white/[0.06] sm:pl-3 pt-2 sm:pt-0">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                Clearance
              </span>
              <span className="text-xs font-bold text-[#FFFC00] mt-0.5">
                Sovereign Tier
              </span>
            </div>
            <div className="flex flex-col border-t sm:border-t-0 sm:border-l border-white/[0.06] sm:pl-3 pt-2 sm:pt-0">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                Commissioned
              </span>
              <span className="text-xs font-bold text-zinc-300 mt-0.5">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveAccount} className="flex flex-col gap-5">
            <div className="space-y-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-zinc-400 font-semibold block">
                Primary Operator Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-zinc-400 font-semibold block">
                Timezone Enclave
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-[#18181B] border border-white/[0.08] text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#FFFC00] focus:ring-1 focus:ring-[#FFFC00]/30 transition-all cursor-pointer font-sans"
              >
                <option value="UTC">UTC (Universal Coordinated)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Chicago">America/Chicago (CST)</option>
                <option value="America/Denver">America/Denver (MST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="Europe/Paris">Europe/Paris (CET)</option>
                <option value="Asia/Karachi">Asia/Karachi (PKT)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                <option value="Pacific/Auckland">Pacific/Auckland (NZST)</option>
              </select>
              <p className="font-mono text-[10px] text-zinc-500 mt-1">
                Your daily habit streak resets at 00:00:00 in this designated timezone.
              </p>
            </div>

            {/* Identity Isolation Callout */}
            <div className="p-3.5 bg-[#18181B] border-l-2 border-[#FFFC00] rounded-r-xl flex items-start gap-3">
              <Info className="w-4 h-4 text-[#FFFC00] shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-400 leading-relaxed">
                <strong className="text-white">Identity Isolation:</strong> Account changes only modify authentication credentials. Streaks, logs, and capital receipts remain cryptographically indexed to your user record.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
              <span className="font-mono text-[11px] text-zinc-500">
                Auto-saved upon submission
              </span>
              <Button
                type="submit"
                variant="primary"
                disabled={isPending}
                className="rounded-xl px-6"
              >
                <Save className="w-4 h-4 mr-1.5 inline" />
                <span>{isPending ? "Synchronizing..." : "Save Account Settings"}</span>
              </Button>
            </div>
          </form>
        </section>

        {/* Section 02: Avatar Credentials (5 Cols) */}
        <section className="settings-section lg:col-span-5 flex flex-col gap-6 bg-[#141416] border border-white/[0.08] p-6 rounded-2xl relative">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1C1C20] border border-white/[0.08] flex items-center justify-center text-[#FFFC00]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#FFFC00] font-bold">
                  Section 02
                </span>
                <h2 className="text-lg font-bold text-white leading-tight">
                  Avatar Credentials
                </h2>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[#00D664] bg-[#00D664]/10 border border-[#00D664]/30 px-2 py-0.5 rounded-full font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D664]" /> ACTIVE
            </span>
          </div>

          {/* Upload Component */}
          <div className="space-y-4">
            <AvatarUpload currentAvatarUrl={user.avatarUrl} />
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Your avatar displays in the desktop telemetry sidebar, mobile command capsules, and sovereign profile readouts.
            </p>
          </div>
        </section>
      </div>

      {/* ─── SECTION 03: THEME & COLOR PALETTE ───────────────────────────── */}
      <section className="settings-section bg-[#141416] border border-white/[0.08] p-6 rounded-2xl space-y-5">
        <div className="pb-3 border-b border-white/[0.08]">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#FFFC00] font-bold">
            Section 03
          </span>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Color Spectrum &amp; Visual Tokens
          </h2>
          <p className="font-mono text-xs text-zinc-400 mt-1">
            Choose your preferred sovereign ambient spectrum.
          </p>
        </div>
        <ThemeSelector initialTheme={user.preferredTheme || "midnight-galaxy"} />
      </section>

      {/* ─── SECTION 04: PWA DESKTOP INSTALLATION ─────────────────────────── */}
      <section className="settings-section bg-[#141416] border border-white/[0.08] p-6 sm:p-7 rounded-2xl relative space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1C1C20] border border-white/[0.08] flex items-center justify-center text-[#FFFC00]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#FFFC00] font-bold">
                Section 04
              </span>
              <h2 className="text-lg font-bold text-white leading-tight">
                Install The Warden (PWA Desktop / Mobile)
              </h2>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 font-mono text-xs px-3 py-1 bg-[#00D664]/10 text-[#00D664] border border-[#00D664]/30 rounded-full font-bold self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D664] animate-pulse" />
            STANDALONE READY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#18181B] border border-white/[0.06] rounded-xl flex flex-col gap-1.5">
            <div className="font-mono text-[11px] text-[#FFFC00] font-bold uppercase tracking-wider">
              Offline Habit Engine
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Check off daily habits and records offline. Records synchronize automatically when connection restores.
            </p>
          </div>
          <div className="p-4 bg-[#18181B] border border-white/[0.06] rounded-xl flex flex-col gap-1.5">
            <div className="font-mono text-[11px] text-[#0096FF] font-bold uppercase tracking-wider">
              Instant Dock Launch
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Cold boots in under 100ms with native OS dock placement, no browser URL bars, and distraction-free UI.
            </p>
          </div>
          <div className="p-4 bg-[#18181B] border border-white/[0.06] rounded-xl flex flex-col gap-1.5">
            <div className="font-mono text-[11px] text-[#00D664] font-bold uppercase tracking-wider">
              Air-Gapped Sandbox
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Completely insulated from third-party browser extensions, ad trackers, and tab switching fatigue.
            </p>
          </div>
        </div>

        <div className="p-4 bg-[#18181B] border border-white/[0.06] rounded-xl text-xs space-y-2 text-zinc-400 font-mono">
          <div className="font-bold text-white uppercase text-[11px] tracking-wider mb-1">
            Manual Installation Walkthrough:
          </div>
          <p>• <strong className="text-white">macOS / iOS (Safari):</strong> Click Share icon (<span className="text-[#FFFC00]">↑</span>) → Select <strong className="text-[#FFFC00]">Add to Dock / Home Screen</strong>.</p>
          <p>• <strong className="text-white">Windows / Android (Chrome/Edge):</strong> Click Install (<span className="text-[#FFFC00]">⊕</span>) in the right side of the address bar → Select <strong className="text-[#FFFC00]">Install The Warden</strong>.</p>
        </div>
      </section>

      {/* ─── SECTION 05: SOVEREIGN DATA EXPORT ────────────────────────────── */}
      <section className="settings-section bg-[#141416] border border-white/[0.08] p-6 sm:p-7 rounded-2xl relative space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1C1C20] border border-white/[0.08] flex items-center justify-center text-[#FFFC00]">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#FFFC00] font-bold">
                Section 05
              </span>
              <h2 className="text-lg font-bold text-white leading-tight">
                Export Sovereign Archive (JSON Backup)
              </h2>
            </div>
          </div>
          <span className="font-mono text-xs text-zinc-400 bg-[#18181B] border border-white/[0.06] px-3 py-1 rounded-full self-start sm:self-auto">
            Zero-Knowledge Format
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 bg-[#18181B] border border-white/[0.06] rounded-xl flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Habit Ledgers</span>
              <span className="text-[10px] font-mono text-[#00D664] bg-[#00D664]/10 px-1.5 py-0.5 rounded">Verified</span>
            </div>
            <span className="font-mono text-[10px] text-zinc-500">habits.json</span>
          </div>
          <div className="p-3.5 bg-[#18181B] border border-white/[0.06] rounded-xl flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Capital Movements</span>
              <span className="text-[10px] font-mono text-[#00D664] bg-[#00D664]/10 px-1.5 py-0.5 rounded">Verified</span>
            </div>
            <span className="font-mono text-[10px] text-zinc-500">transactions.json</span>
          </div>
          <div className="p-3.5 bg-[#18181B] border border-white/[0.06] rounded-xl flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Bills &amp; OCR</span>
              <span className="text-[10px] font-mono text-[#00D664] bg-[#00D664]/10 px-1.5 py-0.5 rounded">Verified</span>
            </div>
            <span className="font-mono text-[10px] text-zinc-500">bills.json</span>
          </div>
          <div className="p-3.5 bg-[#18181B] border border-white/[0.06] rounded-xl flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Operator State</span>
              <span className="text-[10px] font-mono text-[#00D664] bg-[#00D664]/10 px-1.5 py-0.5 rounded">Verified</span>
            </div>
            <span className="font-mono text-[10px] text-zinc-500">user.json</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <p className="text-xs text-zinc-400 max-w-lg leading-relaxed">
            Download an unencrypted, portable JSON archive of all your habits, records, bills, transactions, and reflections.
          </p>
          <Button
            variant="secondary"
            onClick={handleExport}
            disabled={isPending}
            className="rounded-xl shrink-0"
          >
            <Download className="w-4 h-4 mr-1.5 inline" />
            <span>{isPending ? "Generating..." : "Download JSON Archive"}</span>
          </Button>
        </div>
      </section>

      {/* ─── SECTION 06: DANGER ZONE (HIGH-FRICTION SECURITY GATES) ──────── */}
      <section className="settings-section bg-[#1A1012] border border-[#FF2D55]/30 p-6 sm:p-7 rounded-2xl relative shadow-xl shadow-red-950/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#FF2D55]/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2D1217] border border-[#FF2D55]/40 flex items-center justify-center text-[#FF2D55]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#FF2D55] font-bold">
                Section 06 // High-Friction Gate
              </span>
              <h2 className="text-lg font-bold text-white leading-tight">
                Danger Zone
              </h2>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 font-mono text-xs px-3 py-1 bg-[#FF2D55]/20 text-[#FF2D55] border border-[#FF2D55]/40 rounded-full font-bold self-start sm:self-auto">
            RESTRICTED PROCEDURES
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Procedure A: Reset Active Streak */}
          <div className="p-5 bg-[#141416] border border-white/[0.08] rounded-xl flex flex-col justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="text-zinc-500 uppercase tracking-wider">Procedure A-01</span>
                <span className="text-[#00D664] bg-[#00D664]/10 px-2 py-0.5 rounded font-bold">Non-Destructive</span>
              </div>
              <h3 className="text-sm font-bold text-white">Reset Active Streak</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Resets current streak counter to 0. Longest streak records and habit history remain preserved in database.
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setResetModalOpen(true)}
              className="w-full rounded-xl"
            >
              <RotateCcw className="w-4 h-4 mr-1.5 inline" />
              <span>Reset Active Streak</span>
            </Button>
          </div>

          {/* Procedure B: Permanent Deletion Gate */}
          <div className="p-5 bg-[#201215] border border-[#FF2D55]/30 rounded-xl flex flex-col justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="text-[#FF2D55] uppercase tracking-wider font-bold">Procedure D-99</span>
                <span className="text-[#FF2D55] bg-[#FF2D55]/10 px-2 py-0.5 rounded font-bold">Irreversible Wipe</span>
              </div>
              <h3 className="text-sm font-bold text-white">Eradicate Account &amp; Data</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Permanently wipes all recorded habits, bills, capital ledgers, and identity credentials from the database.
              </p>
            </div>
            <Button
              variant="danger"
              onClick={() => setDeleteModalOpen(true)}
              className="w-full rounded-xl"
            >
              <AlertTriangle className="w-4 h-4 mr-1.5 inline" />
              <span>Initiate Account Deletion</span>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── MODALS ──────────────────────────────────────────────────────── */}
      {/* Reset Streak Modal */}
      <Modal
        open={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset Active Streak Counter"
      >
        <div className="space-y-5">
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
            This operation resets your active streak counter to 0. Your longest streak record and completed habits will remain preserved in history.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <Button variant="ghost" onClick={() => setResetModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleResetStreak}
              disabled={isPending}
            >
              {isPending ? "Resetting..." : "Confirm Reset"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Modal (High-Friction Gate) */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Permanently Eradicate Account Data"
      >
        <div className="space-y-5">
          <div className="text-xs font-mono text-[#FF2D55] leading-relaxed bg-[#FF2D55]/10 border border-[#FF2D55]/30 p-3.5 rounded-xl">
            ⚠️ HIGH-FRICTION SECURITY GATE: This action will permanently destroy all your habit logs, financial transactions, bill receipts, and account settings. This operation CANNOT be undone.
          </div>
          <div className="space-y-2">
            <label className="font-mono text-xs text-zinc-300 block">
              Type <strong className="text-white select-all bg-black/60 px-1.5 py-0.5 rounded border border-white/10 font-bold">DELETE</strong> to confirm:
            </label>
            <Input
              placeholder="DELETE"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
              Cancel &amp; Retain Vault
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteData}
              disabled={deleteConfirmText !== "DELETE" || isPending}
            >
              {isPending ? "Eradicating..." : "Execute Eradication"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
