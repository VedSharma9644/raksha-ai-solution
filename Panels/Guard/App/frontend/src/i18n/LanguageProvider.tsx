import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { TranslationKey } from './en';
import {
  DEFAULT_LANGUAGE,
  formatLanguageSelection,
  getLanguageOption,
  type AppLanguageCode,
  type AppLanguageOption,
} from './languages';
import { translate } from './locales';
import { loadStoredLanguage, persistLanguage } from './storage';

type TranslateFn = (
  key: TranslationKey,
  params?: Record<string, string | number>,
) => string;

type LanguageContextValue = {
  language: AppLanguageCode;
  languageOption: AppLanguageOption;
  languageLabel: string;
  ready: boolean;
  setLanguage: (code: AppLanguageCode) => void;
  t: TranslateFn;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguageCode>(DEFAULT_LANGUAGE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await loadStoredLanguage();
      if (!cancelled) {
        setLanguageState(stored);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback((code: AppLanguageCode) => {
    setLanguageState(code);
    void persistLanguage(code);
  }, []);

  const t = useCallback<TranslateFn>(
    (key, params) => translate(language, key, params),
    [language],
  );

  const value = useMemo<LanguageContextValue>(() => {
    const languageOption = getLanguageOption(language);
    return {
      language,
      languageOption,
      languageLabel: formatLanguageSelection(language),
      ready,
      setLanguage,
      t,
    };
  }, [language, ready, setLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
