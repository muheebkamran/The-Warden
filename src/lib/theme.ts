/**
 * Centralized Theme & Color Tokens Service
 * 
 * Provides color math, accessible contrast calculation, and CSS variable tokens
 * to ensure that user customizations never break text legibility or UI cohesion.
 */

export interface ThemeConfig {
  accentColor: string;
  backgroundColor: string;
}

export const DEFAULT_THEME: ThemeConfig = {
  accentColor: "#2563eb", // Electric Blue
  backgroundColor: "#f4f6fa", // Crisp Slate Light
};

export const ACCENT_PRESETS = [
  { name: "Electric Blue", value: "#2563eb" },
  { name: "Royal Indigo", value: "#4f46e5" },
  { name: "Violet Iris", value: "#7c3aed" },
  { name: "Emerald Forest", value: "#059669" },
  { name: "Amber Flame", value: "#d97706" },
  { name: "Crimson Red", value: "#dc2626" },
  { name: "Rose Pink", value: "#e11d48" },
  { name: "Ocean Cyan", value: "#0891b2" },
];

export const BACKGROUND_PRESETS = [
  { name: "Crisp Slate", value: "#f4f6fa", dark: false },
  { name: "Pure White", value: "#ffffff", dark: false },
  { name: "Soft Sand", value: "#f8fafc", dark: false },
  { name: "Modern Charcoal", value: "#111827", dark: true },
  { name: "Deep Obsidian", value: "#0b0f19", dark: true },
  { name: "Midnight Navy", value: "#0f172a", dark: true },
];

/**
 * Calculates relative luminance of a hex color (0.0 to 1.0)
 */
export function getRelativeLuminance(hex: string): number {
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length !== 6 && cleanHex.length !== 3) return 0.5;

  let r = 0, g = 0, b = 0;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16) / 255;
    g = parseInt(cleanHex[1] + cleanHex[1], 16) / 255;
    b = parseInt(cleanHex[2] + cleanHex[2], 16) / 255;
  } else {
    r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  }

  const srgb = [r, g, b].map((val) =>
    val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  );

  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

/**
 * Determines whether a color is considered dark (luminance < 0.45)
 */
export function isDarkColor(hex: string): boolean {
  return getRelativeLuminance(hex) < 0.45;
}

/**
 * Returns a high-contrast text color (white or dark slate) for a given background
 */
export function getContrastTextColor(bgHex: string): string {
  return isDarkColor(bgHex) ? "#ffffff" : "#0f172a";
}

/**
 * Generates CSS variable style rules based on user settings
 */
export function computeThemeTokens(theme: ThemeConfig) {
  const isDarkBg = isDarkColor(theme.backgroundColor);
  const brandContrastText = getContrastTextColor(theme.accentColor);

  return {
    "--brand": theme.accentColor,
    "--brand-text": brandContrastText,
    "--bg-app": theme.backgroundColor,
    "--card-bg": isDarkBg ? "#1a2234" : "#ffffff",
    "--card-border": isDarkBg ? "#2b3548" : "#e2e8f0",
    "--card-subtle": isDarkBg ? "#141c2c" : "#f8fafc",
    "--text-main": isDarkBg ? "#f8fafc" : "#0f172a",
    "--text-muted": isDarkBg ? "#94a3b8" : "#64748b",
    "--text-subtle": isDarkBg ? "#64748b" : "#94a3b8",
    "--sidebar-bg": isDarkBg ? "#0f1422" : "#1a1f2c",
    "--sidebar-border": isDarkBg ? "#1e2638" : "#262e3d",
  };
}

export function computeThemeStyleString(theme: ThemeConfig): string {
  const tokens = computeThemeTokens(theme);
  return Object.entries(tokens)
    .map(([key, val]) => `${key}: ${val};`)
    .join(" ");
}
