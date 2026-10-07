import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const shiftFieldCommandCardStyles = StyleSheet.create({
  card: {
    backgroundColor: appColors.surfaceContainerLowest,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    gap: appSpacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.xs,
  },
  headerTitle: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
  },
  status: {
    ...appTypography.labelLg,
    color: appColors.primary,
    fontFamily: 'PublicSans_600SemiBold',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.sm,
    padding: appSpacing.sm,
    backgroundColor: appColors.surfaceContainer,
    borderRadius: appRadii.xl,
  },
  photo: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  name: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
  },
  role: {
    ...appTypography.labelLg,
    color: appColors.onSurfaceVariant,
  },
  phone: {
    ...appTypography.bodyLg,
    color: appColors.onSurface,
    fontFamily: 'PublicSans_500Medium',
  },
  actions: {
    gap: appSpacing.xs,
  },
  primaryButton: {
    height: 56,
    borderRadius: appRadii.xl,
    backgroundColor: appColors.primaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonPressed: {
    backgroundColor: appColors.primary,
  },
  primaryButtonText: {
    ...appTypography.labelXl,
    color: appColors.onPrimary,
  },
  secondaryButton: {
    height: 56,
    borderRadius: appRadii.xl,
    backgroundColor: appColors.surfaceContainerHighest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonPressed: {
    backgroundColor: appColors.surfaceContainerHigh,
  },
  secondaryButtonText: {
    ...appTypography.labelXl,
    color: appColors.onSurface,
  },
});
