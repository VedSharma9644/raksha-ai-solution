import {
  APP_LANGUAGES,
  DEFAULT_LANGUAGE_ID,
  getLanguageById,
  googleIncludedLanguageCodes,
} from "./indianLanguages";

export const LANGUAGE_STORAGE_KEY = "raskha.uiLanguage";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            includedLanguages?: string;
            autoDisplay?: boolean;
          },
          elementId: string
        ) => void;
      };
    };
  }
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeSeconds?: number) {
  const age =
    maxAgeSeconds === undefined ? "" : `;max-age=${Math.max(0, maxAgeSeconds)}`;
  const base = `${name}=${encodeURIComponent(value)};path=/${age}`;
  document.cookie = base;
  // Also try host-only variants Google sometimes writes
  document.cookie = `${base};domain=${window.location.hostname}`;
}

function clearTranslateCookies() {
  const expire = ";max-age=0";
  for (const name of ["googtrans", "googtrans"]) {
    document.cookie = `${name}=;path=/${expire}`;
    document.cookie = `${name}=;path=/${expire};domain=${window.location.hostname}`;
    const parts = window.location.hostname.split(".");
    if (parts.length > 2) {
      const root = parts.slice(-2).join(".");
      document.cookie = `${name}=;path=/${expire};domain=.${root}`;
    }
  }
}

export function getSavedLanguageId(): string {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY)?.trim();
    if (saved && getLanguageById(saved)) return saved;
  } catch {
    /* ignore */
  }
  return DEFAULT_LANGUAGE_ID;
}

export function getSavedLanguageLabel(): string {
  const language = getLanguageById(getSavedLanguageId());
  if (!language) return "English";
  return language.id === "en"
    ? language.name
    : `${language.name} · ${language.nativeName}`;
}

function ensureTranslateHostElement() {
  if (document.getElementById("google_translate_element")) return;
  const host = document.createElement("div");
  host.id = "google_translate_element";
  host.setAttribute("aria-hidden", "true");
  host.style.display = "none";
  document.body.appendChild(host);
}

function loadGoogleTranslateScript(): Promise<void> {
  if (document.getElementById("raskha-google-translate")) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    window.googleTranslateElementInit = () => {
      try {
        ensureTranslateHostElement();
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: googleIncludedLanguageCodes(),
              autoDisplay: false,
            },
            "google_translate_element"
          );
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    };

    const script = document.createElement("script");
    script.id = "raskha-google-translate";
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.onerror = () =>
      reject(new Error("Failed to load Google Translate script"));
    document.head.appendChild(script);
  });
}

/**
 * Call once at app startup. Restores the saved language and loads the
 * browser page translator when a non-English Indian language is selected.
 */
export function bootstrapPageLanguage(): void {
  const languageId = getSavedLanguageId();
  const language = getLanguageById(languageId) ?? APP_LANGUAGES[0];
  document.documentElement.lang = language.id;

  if (!language.googleCode || language.googleCode === "en") {
    clearTranslateCookies();
    return;
  }

  const expected = `/en/${language.googleCode}`;
  if (readCookie("googtrans") !== expected) {
    writeCookie("googtrans", expected);
  }

  void loadGoogleTranslateScript().catch(() => {
    // Preference still stored; page stays in English if script is blocked.
  });
}

/**
 * Persist selection and reload so the page translator can apply cleanly.
 */
export function applyPageLanguage(languageId: string): void {
  const language = getLanguageById(languageId);
  if (!language) return;

  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language.id);
  } catch {
    /* ignore */
  }

  document.documentElement.lang = language.id;

  if (!language.googleCode || language.googleCode === "en") {
    clearTranslateCookies();
  } else {
    writeCookie("googtrans", `/en/${language.googleCode}`);
  }

  window.location.reload();
}
