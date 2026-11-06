import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const relieveMethodOptionsStyles = StyleSheet.create({
  section: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: appColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    ...appTypography.labelLg,
    color: appColors.onPrimary,
    fontFamily: 'PublicSans_700Bold',
  },
  stepTitle: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
    flexShrink: 1,
  },
  list: {
    gap: appSpacing.sm,
  },
  optionCard: {
    backgroundColor: appColors.surfaceContainerLowest,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: appSpacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  optionCardSelected: {
    backgroundColor: 'rgba(220, 233, 255, 0.6)',
  },
  radioWrap: {
    marginTop: 4,
  },
  optionCopy: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  optionTitle: {
    ...appTypography.labelXl,
    color: appColors.onSurface,
    fontFamily: 'PublicSans_700Bold',
  },
  recommendedBadge: {
    backgroundColor: appColors.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: appRadii.sm,
  },
  recommendedText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  optionDescription: {
    ...appTypography.bodyLg,
    color: appColors.onSurfaceVariant,
  },
});
