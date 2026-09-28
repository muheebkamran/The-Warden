"use client";

import { useState, useTransition } from "react";
import {
  Sparkles,
  User,
  Palette,
  Check,
  Save,
  Database,
  CheckCircle2,
  RefreshCw,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { updateUserSettings } from "@/app/actions";
import {
  ACCENT_PRESETS,
  BACKGROUND_PRESETS,
  computeThemeTokens,
  isDarkColor,
} from "@/lib/theme";

interface UserSettingsData {
  id: string;
  name: string;
  accentColor: string;
  backgroundColor: string;
}

interface SettingsManagerProps {
  initialSettings: UserSettingsData;
}

export function SettingsManager({ initialSettings }: SettingsManagerProps) {
  const [name, setName] = useState(initialSettings.name || "Muheeb");
  const [accentColor, setAccentColor] = useState(initialSettings.accentColor || "#2563eb");
  const [backgroundColor, setBackgroundColor] = useState(
    initialSettings.backgroundColor || "#f4f6fa"
  );
  const [isSaved, setIsSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Dynamically update document style in real time as the user selects colors
  const applyThemeLive = (accent: string, bg: string) => {
    const tokens = computeThemeTokens({ accentColor: accent, backgroundColor: bg });
    for (const [key, val] of Object.entries(tokens)) {
      document.documentElement.style.setProperty(key, val);
    }
  };

  const handleAccentChange = (hex: string) => {
    setAccentColor(hex);
    setIsSaved(false);
    applyThemeLive(hex, backgroundColor);
  };

  const handleBgChange = (hex: string) => {
    setBackgroundColor(hex);
    setIsSaved(false);
    applyThemeLive(accentColor, hex);
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append("name", name.trim() || "Muheeb");
    formData.append("accentColor", accentColor);
    formData.append("backgroundColor", backgroundColor);

    startTransition(async () => {
      await updateUserSettings(formData);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    });
  };

  const isDarkBg = isDarkColor(backgroundColor);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-app,#f4f6fa)]">
      {/* Top Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-6 sm:px-8 py-5 sticky top-0 z-20 transition-colors">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-main,#0f172a)]">
                Settings & Preferences
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--brand,#2563eb)]/10 text-[var(--brand,#2563eb)] border border-[var(--brand,#2563eb)]/20">
                Persistent Profile
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted,#64748b)] mt-0.5">
              Manage your personal identity, theme tokens, and persistent system configuration.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand,#2563eb)] text-[var(--brand-text,#ffffff)] text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition"
          >
            {isPending ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : isSaved ? (
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isPending ? "Saving..." : isSaved ? "Saved to DB" : "Save Changes"}</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="p-6 sm:p-8 max-w-4xl mx-auto w-full flex-1 space-y-6">
        {/* Success Confirmation Toast Banner */}
        {isSaved && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-200 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Your profile and theme preferences have been securely saved to the persistent database.
            </span>
          </div>
        )}

        {/* ─── Profile Settings ──────────────────────────────────────────────── */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-[var(--brand,#2563eb)]/10 text-[var(--brand,#2563eb)] flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-main,#0f172a)] uppercase tracking-wide">
                User Profile
              </h2>
              <p className="text-xs text-[var(--text-muted,#64748b)]">
                Your name powers the personalized welcome greeting and accountability identity.
              </p>
            </div>
          </div>

          <div className="max-w-md space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setIsSaved(false);
              }}
              placeholder="e.g. Muheeb"
              className="w-full text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-[var(--brand,#2563eb)] text-slate-900 dark:text-slate-100 font-medium"
            />
            <p className="text-[11px] text-slate-400">
              Default is &quot;Muheeb&quot;. Updating this updates the welcome animation on Home.
            </p>
          </div>
        </section>

        {/* ─── Appearance & Theme Settings ───────────────────────────────────── */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-[var(--brand,#2563eb)]/10 text-[var(--brand,#2563eb)] flex items-center justify-center font-bold">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-main,#0f172a)] uppercase tracking-wide">
                Appearance & Customization
              </h2>
              <p className="text-xs text-[var(--text-muted,#64748b)]">
                Customize item accent colors and overall background color with automatic contrast protection.
              </p>
            </div>
          </div>

          {/* 1. Item / Accent Color */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  Item / Accent Color
                </h3>
                <p className="text-[11px] text-slate-500">
                  Applied to buttons, active navigation, progress bars, and checkboxes.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => handleAccentChange(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                  title="Pick custom accent color"
                />
                <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                  {accentColor}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ACCENT_PRESETS.map((preset) => {
                const isSelected = accentColor.toLowerCase() === preset.value.toLowerCase();
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handleAccentChange(preset.value)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium transition ${
                      isSelected
                        ? "border-[var(--brand,#2563eb)] bg-blue-50/50 dark:bg-blue-950/30 text-[var(--brand,#2563eb)] font-bold shadow-xs"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full shadow-2xs shrink-0 flex items-center justify-center text-white"
                      style={{ backgroundColor: preset.value }}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className="truncate">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Whole Screen / Background Color */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  Background / Screen Color
                </h3>
                <p className="text-[11px] text-slate-500">
                  Applied to the entire page canvas. Text colors adapt dynamically to preserve legibility.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => handleBgChange(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                  title="Pick custom background color"
                />
                <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                  {backgroundColor}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {BACKGROUND_PRESETS.map((preset) => {
                const isSelected = backgroundColor.toLowerCase() === preset.value.toLowerCase();
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handleBgChange(preset.value)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium transition ${
                      isSelected
                        ? "border-[var(--brand,#2563eb)] bg-blue-50/50 dark:bg-blue-950/30 text-[var(--brand,#2563eb)] font-bold shadow-xs"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shadow-2xs shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: preset.value }}
                    >
                      {isSelected && (
                        <Check
                          className={`w-2.5 h-2.5 stroke-[3] ${
                            preset.dark ? "text-white" : "text-slate-900"
                          }`}
                        />
                      )}
                    </div>
                    <span className="truncate">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Live Preview Card */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Live Theme Preview
            </h3>
            <div
              className="p-5 rounded-2xl border transition-colors shadow-2xs space-y-4"
              style={{
                backgroundColor: isDarkBg ? "#1a2234" : "#ffffff",
                borderColor: isDarkBg ? "#2b3548" : "#e2e8f0",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-sm font-bold"
                    style={{ color: isDarkBg ? "#f8fafc" : "#0f172a" }}
                  >
                    Preview: Daily Discipline Card
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: isDarkBg ? "#94a3b8" : "#64748b" }}
                  >
                    High contrast text guaranteed across themes
                  </p>
                </div>

                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center shadow-xs"
                  style={{ backgroundColor: accentColor, color: "#ffffff" }}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              {/* Progress Bar in selected color */}
              <div className="space-y-1">
                <div
                  className="flex justify-between text-[11px] font-bold"
                  style={{ color: isDarkBg ? "#cbd5e1" : "#475569" }}
                >
                  <span>Sample Progress</span>
                  <span style={{ color: accentColor }}>75%</span>
                </div>
                <div
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: isDarkBg ? "#2d3748" : "#e2e8f0" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: "75%", backgroundColor: accentColor }}
                  />
                </div>
              </div>

              {/* Action Buttons in selected color */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-2xs"
                  style={{ backgroundColor: accentColor }}
                >
                  Primary Action
                </button>
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border"
                  style={{
                    color: isDarkBg ? "#e2e8f0" : "#334155",
                    borderColor: isDarkBg ? "#3b4252" : "#cbd5e1",
                    backgroundColor: isDarkBg ? "#232c3d" : "#f8fafc",
                  }}
                >
                  Secondary Action
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Persistent Architecture & Storage Status ──────────────────────── */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-main,#0f172a)] uppercase tracking-wide">
                Database & Persistence Architecture
              </h2>
              <p className="text-xs text-[var(--text-muted,#64748b)]">
                Local development vs Cloudflare D1 production database.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
                <Laptop className="w-4 h-4 text-blue-600" />
                <span>Local Development Database</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Stored persistently in <code className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">prisma/dev.db</code>.
                Survives browser refresh and computer reboot.
              </p>
              <div className="pt-2 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                Restart command: <strong className="text-slate-900 dark:text-slate-100">npm run dev</strong>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Cloudflare D1 Production</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Managed serverless SQLite on Cloudflare D1. Runs globally in the cloud even when your computer is turned off.
              </p>
              <div className="pt-2 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                Schema binding: <code className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">wrangler.toml [d1_databases]</code>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
