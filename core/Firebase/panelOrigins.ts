/**
 * Production Firebase Hosting origins for each panel.
 * Keep these in sync with .firebaserc hosting sites.
 */
export const PANEL_ORIGINS = {
  superAdmin: "https://app-raksha-super-admin.web.app",
  agencyAdmin: "https://app-raksha-agency-admin.web.app",
  hr: "https://app-raksha-hr.web.app",
} as const;

export type PanelKey = keyof typeof PANEL_ORIGINS;

const LOCAL_DEV_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
  "http://127.0.0.1:5176",
] as const;

function isLocalHostname(host: string): boolean {
  return host === "localhost" || host === "127.0.0.1";
}

function isHostingHostname(host: string): boolean {
  return host.endsWith(".web.app") || host.endsWith(".firebaseapp.com");
}

/** Hostname used as Firebase `authDomain` for a given panel Hosting site. */
export function panelAuthDomain(panel: PanelKey): string {
  return new URL(PANEL_ORIGINS[panel]).hostname;
}

/**
 * Resolve authDomain for a browser app:
 * - Localhost / 127.0.0.1 → always use FIREBASE_AUTH_DOMAIN from env
 *   (typically projectId.firebaseapp.com). Never force a Hosting hostname.
 * - On Hosting (*.web.app / *.firebaseapp.com) → use the live hostname so Auth
 *   shares the site origin.
 * - Anything else → env, then the panel's production host.
 */
export function resolveBrowserAuthDomain(
  panel: PanelKey,
  envAuthDomain?: string
): string {
  const env = envAuthDomain?.trim() || undefined;

  if (typeof window !== "undefined") {
    const host = window.location.hostname;

    if (isLocalHostname(host)) {
      if (!env) {
        throw new Error(
          "FIREBASE_AUTH_DOMAIN is required for local development"
        );
      }
      return env;
    }

    if (isHostingHostname(host)) {
      return host;
    }
  }

  return env || panelAuthDomain(panel);
}

/**
 * Continue URL for password-reset / email action links.
 * Uses the current origin when running locally so resets stay on the
 * local panel; otherwise uses the panel's production Hosting URL.
 */
export function panelActionCodeSettings(panel: PanelKey, path = "/") {
  const base =
    typeof window !== "undefined" && isLocalHostname(window.location.hostname)
      ? window.location.origin
      : PANEL_ORIGINS[panel];

  return {
    url: new URL(path, base).toString(),
    handleCodeInApp: false as const,
  };
}

/** Production + local Vite origins allowed to call panel backends (CORS). */
export function getCorsAllowedOrigins(extraFromEnv?: string): string[] {
  const fromEnv = (extraFromEnv ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return [
    ...Object.values(PANEL_ORIGINS),
    ...LOCAL_DEV_ORIGINS,
    ...fromEnv,
  ];
}

/**
 * True when an Origin header should be allowed for local API calls.
 * Accepts any localhost / 127.0.0.1 port so Vite's free-port fallback works.
 */
export function isAllowedCorsOrigin(
  origin: string | undefined,
  extraFromEnv?: string
): boolean {
  if (!origin) return false;
  if (getCorsAllowedOrigins(extraFromEnv).includes(origin)) return true;

  try {
    const url = new URL(origin);
    return isLocalHostname(url.hostname);
  } catch {
    return false;
  }
}
