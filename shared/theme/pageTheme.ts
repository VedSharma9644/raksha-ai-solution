import { bootstrapPageAppearance } from "../appearance/pageAppearance";

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "raskha.uiTheme";
export const DEFAULT_THEME_PREFERENCE: ThemePreference = "system";

export const THEME_OPTIONS: Array<{
  id: ThemePreference;
  label: string;
  description: string;
}> = [
  {
    id: "system",
    label: "System",
    description: "Match your device setting",
  },
  {
    id: "light",
    label: "Light",
    description: "Bright surfaces and clear contrast",
  },
  {
    id: "dark",
    label: "Dark",
    description: "Dim surfaces for low-light use",
  },
];

export function isThemePreference(value: string): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === "system" ? getSystemTheme() : preference;
}

export function getSavedThemePreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)?.trim();
    if (saved && isThemePreference(saved)) return saved;
  } catch {
    /* ignore */
  }
  return DEFAULT_THEME_PREFERENCE;
}

export function getSavedThemeLabel(): string {
  const preference = getSavedThemePreference();
  return THEME_OPTIONS.find((option) => option.id === preference)?.label ?? "System";
}

function applyResolvedTheme(resolved: ResolvedTheme) {
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
  bootstrapPageAppearance();
}

let systemListener: ((event: MediaQueryListEvent) => void) | null = null;
let systemMedia: MediaQueryList | null = null;

function clearSystemListener() {
  if (systemMedia && systemListener) {
    systemMedia.removeEventListener("change", systemListener);
  }
  systemMedia = null;
  systemListener = null;
}

function watchSystemTheme() {
  clearSystemListener();
  if (typeof window === "undefined" || !window.matchMedia) return;

  systemMedia = window.matchMedia("(prefers-color-scheme: dark)");
  systemListener = () => {
    if (getSavedThemePreference() === "system") {
      applyResolvedTheme(getSystemTheme());
    }
  };
  systemMedia.addEventListener("change", systemListener);
}

/** Apply theme from storage and listen for OS changes when set to System. */
export function bootstrapPageTheme(): void {
  const preference = getSavedThemePreference();
  applyResolvedTheme(resolveTheme(preference));
  if (preference === "system") {
    watchSystemTheme();
  } else {
    clearSystemListener();
  }
}

/** Persist and apply a theme preference immediately (no reload). */
export function applyPageTheme(preference: ThemePreference): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    /* ignore */
  }
  applyResolvedTheme(resolveTheme(preference));
  if (preference === "system") {
    watchSystemTheme();
  } else {
    clearSystemListener();
  }
}
