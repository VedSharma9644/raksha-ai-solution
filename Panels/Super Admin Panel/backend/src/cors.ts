const PANEL_ORIGINS = [
  "https://amrat-security-super-admin.web.app",
  "https://security-app-agency-admin.web.app",
  "https://security-app-hr.web.app",
];

function isLocalHostname(host: string): boolean {
  return host === "localhost" || host === "127.0.0.1";
}

export function isAllowedCorsOrigin(
  origin: string | undefined,
  extraFromEnv?: string
): boolean {
  if (!origin) return false;

  const extras = (extraFromEnv ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (PANEL_ORIGINS.includes(origin) || extras.includes(origin)) {
    return true;
  }

  try {
    return isLocalHostname(new URL(origin).hostname);
  } catch {
    return false;
  }
}
