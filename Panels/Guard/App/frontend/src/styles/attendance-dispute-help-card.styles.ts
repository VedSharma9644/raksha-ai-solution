import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const attendanceDisputeHelpCardStyles = StyleSheet.create({
  card: {
    backgroundColor: appColors.surfaceContainer,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    gap: appSpacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  title: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
  },
  primaryButton: {
    height: 52,
    borderRadius: appRadii.xl,
    backgroundColor: appColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonPressed: {
    backgroundColor: appColors.primaryContainer,
  },
  primaryLabel: {
    ...appTypography.labelXl,
    color: appColors.onPrimary,
  },
  secondaryButton: {
    height: 52,
    borderRadius: appRadii.xl,
    backgroundColor: appColors.surfaceContainerHigh,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonPressed: {
    backgroundColor: appColors.surfaceContainerHighest,
  },
  secondaryLabel: {
    ...appTypography.labelXl,
    color: appColors.onSurface,
  },
});
