import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_LANGUAGE,
  isAppLanguageCode,
  type AppLanguageCode,
} from './languages';

const LANGUAGE_STORAGE_KEY = '@raskha/guard-app/language';

export async function loadStoredLanguage(): Promise<AppLanguageCode> {
  try {
    const value = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (value && isAppLanguageCode(value)) {
      return value;
    }
  } catch {
    // Ignore storage read failures — fall back to default.
  }
  return DEFAULT_LANGUAGE;
}

export async function persistLanguage(code: AppLanguageCode): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, code);
  } catch {
    // Ignore storage write failures — in-memory language still applies.
  }
}
