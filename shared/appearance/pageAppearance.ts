export interface AppearanceColors {
  primary: string;
  secondary: string;
}

export interface AppearancePreset extends AppearanceColors {
  id: string;
  name: string;
}

export const APPEARANCE_STORAGE_KEY = "raskha.uiAppearance";

export const DEFAULT_APPEARANCE: AppearanceColors = {
  primary: "#1e5e63",
  secondary: "#595f68",
};

export const APPEARANCE_PRESETS: AppearancePreset[] = [
  {
    id: "raksha",
    name: "Raksha Teal",
    primary: "#1e5e63",
    secondary: "#595f68",
  },
  {
    id: "ocean",
    name: "Ocean Blue",
    primary: "#1d4ed8",
    secondary: "#64748b",
  },
  {
    id: "forest",
    name: "Forest Green",
    primary: "#166534",
    secondary: "#57534e",
  },
  {
    id: "royal",
    name: "Royal Purple",
    primary: "#6d28d9",
    secondary: "#6b7280",
  },
  {
    id: "sunset",
    name: "Sunset Amber",
    primary: "#c2410c",
    secondary: "#78716c",
  },
  {
    id: "rose",
    name: "Rose",
    primary: "#be123c",
    secondary: "#6b7280",
  },
  {
    id: "slate",
    name: "Slate",
    primary: "#334155",
    secondary: "#64748b",
  },
  {
    id: "india",
    name: "Saffron",
    primary: "#c2410c",
    secondary: "#0f766e",
  },
];

const HEX_PATTERN = /^#([0-9a-fA-F]{6})$/;

export function normalizeHexColor(value: string): string | null {
  const trimmed = value.trim();
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) {
    return `#${trimmed.toLowerCase()}`;
  }
  if (HEX_PATTERN.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  if (/^#([0-9a-fA-F]{3})$/.test(trimmed)) {
    const [, short] = trimmed.match(/^#([0-9a-fA-F]{3})$/)!;
    return `#${short[0]}${short[0]}${short[1]}${short[1]}${short[2]}${short[2]}`.toLowerCase();
  }
  return null;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return null;
  const value = normalized.slice(1);
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const channel = (value: number) => {
    const srgb = value / 255;
    return srgb <= 0.03928
      ? srgb / 12.92
      : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * channel(rgb.r) +
    0.7152 * channel(rgb.g) +
    0.0722 * channel(rgb.b)
  );
}

/** Readable text/icon color on top of a brand fill. */
export function contrastOnColor(hex: string): string {
  return relativeLuminance(hex) > 0.45 ? "#0b1c30" : "#ffffff";
}

export function getSavedAppearance(): AppearanceColors {
  try {
    const raw = localStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_APPEARANCE };
    const parsed = JSON.parse(raw) as Partial<AppearanceColors>;
    const primary = normalizeHexColor(String(parsed.primary ?? ""));
    const secondary = normalizeHexColor(String(parsed.secondary ?? ""));
    if (primary && secondary) {
      return { primary, secondary };
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_APPEARANCE };
}

export function hasCustomAppearance(): boolean {
  try {
    return Boolean(localStorage.getItem(APPEARANCE_STORAGE_KEY));
  } catch {
    return false;
  }
}

export function getSavedAppearanceLabel(): string {
  if (!hasCustomAppearance()) return "Default";
  const current = getSavedAppearance();
  const preset = APPEARANCE_PRESETS.find(
    (item) =>
      item.primary === current.primary && item.secondary === current.secondary
  );
  return preset?.name ?? "Custom";
}

const APPLIED_VARS = [
  "--color-primary",
  "--color-secondary",
  "--color-on-primary",
  "--color-focus",
] as const;

function writeAppearanceVars(appearance: AppearanceColors) {
  const root = document.documentElement;
  const primary = normalizeHexColor(appearance.primary) ?? DEFAULT_APPEARANCE.primary;
  const secondary =
    normalizeHexColor(appearance.secondary) ?? DEFAULT_APPEARANCE.secondary;

  root.style.setProperty("--color-primary", primary);
  root.style.setProperty("--color-secondary", secondary);
  root.style.setProperty("--color-on-primary", contrastOnColor(primary));
  root.style.setProperty("--color-focus", primary);
}

function clearAppearanceVars() {
  const root = document.documentElement;
  for (const key of APPLIED_VARS) {
    root.style.removeProperty(key);
  }
}

/**
 * Restore brand colors. If the user has not chosen Appearance yet,
 * leave CSS theme defaults in place (light/dark brand tokens).
 */
export function bootstrapPageAppearance(): void {
  if (!hasCustomAppearance()) {
    clearAppearanceVars();
    return;
  }
  writeAppearanceVars(getSavedAppearance());
}

export function applyPageAppearance(appearance: AppearanceColors): void {
  const primary =
    normalizeHexColor(appearance.primary) ?? DEFAULT_APPEARANCE.primary;
  const secondary =
    normalizeHexColor(appearance.secondary) ?? DEFAULT_APPEARANCE.secondary;
  const next = { primary, secondary };

  try {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }

  writeAppearanceVars(next);
}

export function resetPageAppearance(): void {
  try {
    localStorage.removeItem(APPEARANCE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  clearAppearanceVars();
}
