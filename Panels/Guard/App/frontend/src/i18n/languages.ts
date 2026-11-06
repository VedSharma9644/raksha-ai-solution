/** App language catalog — English + Hindi + 20 regional Indian languages. */

export type AppLanguageCode =
  | 'en'
  | 'hi'
  | 'bn'
  | 'te'
  | 'mr'
  | 'ta'
  | 'gu'
  | 'ur'
  | 'kn'
  | 'or'
  | 'ml'
  | 'pa'
  | 'as'
  | 'mai'
  | 'ne'
  | 'kok'
  | 'sd'
  | 'doi'
  | 'mni'
  | 'brx'
  | 'sa'
  | 'ks';

export type AppLanguageOption = {
  code: AppLanguageCode;
  /** ISO / BCP-47 style tag when available */
  bcp47: string;
  nameEn: string;
  nameNative: string;
};

export const APP_LANGUAGES: AppLanguageOption[] = [
  { code: 'en', bcp47: 'en-IN', nameEn: 'English', nameNative: 'English' },
  { code: 'hi', bcp47: 'hi-IN', nameEn: 'Hindi', nameNative: 'हिन्दी' },
  { code: 'bn', bcp47: 'bn-IN', nameEn: 'Bengali', nameNative: 'বাংলা' },
  { code: 'te', bcp47: 'te-IN', nameEn: 'Telugu', nameNative: 'తెలుగు' },
  { code: 'mr', bcp47: 'mr-IN', nameEn: 'Marathi', nameNative: 'मराठी' },
  { code: 'ta', bcp47: 'ta-IN', nameEn: 'Tamil', nameNative: 'தமிழ்' },
  { code: 'gu', bcp47: 'gu-IN', nameEn: 'Gujarati', nameNative: 'ગુજરાતી' },
  { code: 'ur', bcp47: 'ur-IN', nameEn: 'Urdu', nameNative: 'اردو' },
  { code: 'kn', bcp47: 'kn-IN', nameEn: 'Kannada', nameNative: 'ಕನ್ನಡ' },
  { code: 'or', bcp47: 'or-IN', nameEn: 'Odia', nameNative: 'ଓଡ଼ିଆ' },
  { code: 'ml', bcp47: 'ml-IN', nameEn: 'Malayalam', nameNative: 'മലയാളം' },
  { code: 'pa', bcp47: 'pa-IN', nameEn: 'Punjabi', nameNative: 'ਪੰਜਾਬੀ' },
  { code: 'as', bcp47: 'as-IN', nameEn: 'Assamese', nameNative: 'অসমীয়া' },
  { code: 'mai', bcp47: 'mai-IN', nameEn: 'Maithili', nameNative: 'मैथिली' },
  { code: 'ne', bcp47: 'ne-IN', nameEn: 'Nepali', nameNative: 'नेपाली' },
  { code: 'kok', bcp47: 'kok-IN', nameEn: 'Konkani', nameNative: 'कोंकणी' },
  { code: 'sd', bcp47: 'sd-IN', nameEn: 'Sindhi', nameNative: 'سنڌي' },
  { code: 'doi', bcp47: 'doi-IN', nameEn: 'Dogri', nameNative: 'डोगरी' },
  { code: 'mni', bcp47: 'mni-IN', nameEn: 'Manipuri', nameNative: 'ꯃꯤꯇꯩꯂꯣꯟ' },
  { code: 'brx', bcp47: 'brx-IN', nameEn: 'Bodo', nameNative: 'बरʼ' },
  { code: 'sa', bcp47: 'sa-IN', nameEn: 'Sanskrit', nameNative: 'संस्कृतम्' },
  { code: 'ks', bcp47: 'ks-IN', nameEn: 'Kashmiri', nameNative: 'कॉशुर' },
];

export const DEFAULT_LANGUAGE: AppLanguageCode = 'en';

export function isAppLanguageCode(value: string): value is AppLanguageCode {
  return APP_LANGUAGES.some((lang) => lang.code === value);
}

export function getLanguageOption(code: AppLanguageCode): AppLanguageOption {
  return (
    APP_LANGUAGES.find((lang) => lang.code === code) ?? APP_LANGUAGES[0]!
  );
}

export function formatLanguageSelection(code: AppLanguageCode): string {
  const lang = getLanguageOption(code);
  if (lang.code === 'en') {
    return `${lang.nameNative} (Currently selected)`;
  }
  return `${lang.nameNative} · ${lang.nameEn} (Currently selected)`;
}
