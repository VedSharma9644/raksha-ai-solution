export {
  APP_LANGUAGES,
  DEFAULT_LANGUAGE_ID,
  filterLanguages,
  getLanguageById,
  googleIncludedLanguageCodes,
  type AppLanguage,
} from "./language/indianLanguages";

export {
  LANGUAGE_STORAGE_KEY,
  applyPageLanguage,
  bootstrapPageLanguage,
  getSavedLanguageId,
  getSavedLanguageLabel,
} from "./language/pageLanguage";

export {
  DEFAULT_THEME_PREFERENCE,
  THEME_OPTIONS,
  THEME_STORAGE_KEY,
  applyPageTheme,
  bootstrapPageTheme,
  getSavedThemeLabel,
  getSavedThemePreference,
  getSystemTheme,
  isThemePreference,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from "./theme/pageTheme";

export {
  APPEARANCE_PRESETS,
  APPEARANCE_STORAGE_KEY,
  DEFAULT_APPEARANCE,
  applyPageAppearance,
  bootstrapPageAppearance,
  contrastOnColor,
  getSavedAppearance,
  getSavedAppearanceLabel,
  hasCustomAppearance,
  normalizeHexColor,
  resetPageAppearance,
  type AppearanceColors,
  type AppearancePreset,
} from "./appearance/pageAppearance";

export {
  AGENCY_MODULE_ACCESS_COLLECTION,
  DEFAULT_ENABLED_FEATURE_IDS,
  FORM_BUILDER_MODULE_ID,
  getAgencyModuleAccess,
  isFormBuilderModuleEnabled,
  isModuleEnabled,
  listAgencyModuleAccess,
  saveAgencyModuleAccess,
  type AgencyModuleAccess,
} from "./modules/agencyModuleAccess";

export {
  ADMIN_DASHBOARD_ACTION_MODULE,
  ADMIN_ROUTE_MODULE,
  HR_DASHBOARD_ACTION_MODULE,
  HR_ROUTE_MODULE,
  PLATFORM_MODULE_IDS,
  isAdminDashboardActionEnabled,
  isHrDashboardActionEnabled,
  isPathModuleEnabled,
  moduleForNotificationAction,
  requiredModuleForAdminPath,
  requiredModuleForHrPath,
  resolveEnabledModules,
  type PlatformModuleId,
} from "./modules/panelModuleMap";
