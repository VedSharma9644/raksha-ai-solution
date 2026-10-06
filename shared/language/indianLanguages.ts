/**
 * Languages for Raskha panels: English + Eighth Schedule (India) regional languages.
 * `googleCode` maps to Google Translate language codes when page translation is available.
 */
export interface AppLanguage {
  id: string;
  /** Google Translate code, or null when not offered by the translator. */
  googleCode: string | null;
  name: string;
  nativeName: string;
  aliases: string[];
}

export const APP_LANGUAGES: AppLanguage[] = [
  {
    id: "en",
    googleCode: "en",
    name: "English",
    nativeName: "English",
    aliases: ["eng", "default"],
  },
  {
    id: "hi",
    googleCode: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    aliases: ["hindi", "हिंदी"],
  },
  {
    id: "bn",
    googleCode: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    aliases: ["bangla", "বাংলা"],
  },
  {
    id: "te",
    googleCode: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    aliases: ["తెలుగు"],
  },
  {
    id: "mr",
    googleCode: "mr",
    name: "Marathi",
    nativeName: "मराठी",
    aliases: ["मराठी"],
  },
  {
    id: "ta",
    googleCode: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
    aliases: ["தமிழ்"],
  },
  {
    id: "ur",
    googleCode: "ur",
    name: "Urdu",
    nativeName: "اردو",
    aliases: ["اردو"],
  },
  {
    id: "gu",
    googleCode: "gu",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    aliases: ["ગુજરાતી"],
  },
  {
    id: "kn",
    googleCode: "kn",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    aliases: ["ಕನ್ನಡ"],
  },
  {
    id: "or",
    googleCode: "or",
    name: "Odia",
    nativeName: "ଓଡ଼ିଆ",
    aliases: ["oriya", "ଓଡ଼ିଆ", "odisha"],
  },
  {
    id: "ml",
    googleCode: "ml",
    name: "Malayalam",
    nativeName: "മലയാളം",
    aliases: ["മലയാളം"],
  },
  {
    id: "pa",
    googleCode: "pa",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
    aliases: ["panjabi", "ਪੰਜਾਬੀ"],
  },
  {
    id: "as",
    googleCode: "as",
    name: "Assamese",
    nativeName: "অসমীয়া",
    aliases: ["asamiya", "অসমীয়া"],
  },
  {
    id: "mai",
    googleCode: "mai",
    name: "Maithili",
    nativeName: "मैथिली",
    aliases: ["मैथिली"],
  },
  {
    id: "sa",
    googleCode: "sa",
    name: "Sanskrit",
    nativeName: "संस्कृतम्",
    aliases: ["संस्कृत", "sanskrit"],
  },
  {
    id: "ne",
    googleCode: "ne",
    name: "Nepali",
    nativeName: "नेपाली",
    aliases: ["नेपाली"],
  },
  {
    id: "sd",
    googleCode: "sd",
    name: "Sindhi",
    nativeName: "سنڌي",
    aliases: ["सिन्धी", "سنڌي"],
  },
  {
    id: "ks",
    googleCode: "ks",
    name: "Kashmiri",
    nativeName: "کٲشُر",
    aliases: ["کٲشُر", "कॉशुर"],
  },
  {
    id: "doi",
    googleCode: "doi",
    name: "Dogri",
    nativeName: "डोगरी",
    aliases: ["डोगरी"],
  },
  {
    id: "mni",
    googleCode: "mni",
    name: "Manipuri",
    nativeName: "মৈতৈলোন্",
    aliases: ["meitei", "meiteilon", "মণিপুরী"],
  },
  {
    id: "sat",
    googleCode: "sat",
    name: "Santali",
    nativeName: "ᱥᱟᱱᱛᱟᱲᱤ",
    aliases: ["santhali", "संताली"],
  },
  {
    id: "bho",
    googleCode: "bho",
    name: "Bhojpuri",
    nativeName: "भोजपुरी",
    aliases: ["भोजपुरी"],
  },
  {
    id: "gom",
    googleCode: "gom",
    name: "Konkani",
    nativeName: "कोंकणी",
    aliases: ["konkani", "कोंकणी", "ಕೊಂಕಣಿ"],
  },
  {
    id: "brx",
    googleCode: null,
    name: "Bodo",
    nativeName: "बर'/बड़ो",
    aliases: ["bodo", "बड़ो"],
  },
];

export const DEFAULT_LANGUAGE_ID = "en";

export function getLanguageById(id: string): AppLanguage | undefined {
  return APP_LANGUAGES.find((language) => language.id === id);
}

export function filterLanguages(
  languages: AppLanguage[],
  query: string
): AppLanguage[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return languages;

  return languages.filter((language) => {
    const haystack = [
      language.name,
      language.nativeName,
      language.id,
      language.googleCode ?? "",
      ...language.aliases,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

/** Codes Google Translate should be allowed to switch into. */
export function googleIncludedLanguageCodes(): string {
  const codes = new Set<string>(["en"]);
  for (const language of APP_LANGUAGES) {
    if (language.googleCode) codes.add(language.googleCode);
  }
  return [...codes].join(",");
}
