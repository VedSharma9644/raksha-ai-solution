import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const shiftCheckoutActionsStyles = StyleSheet.create({
  section: {
    gap: appSpacing.sm,
    paddingTop: appSpacing.sm,
    paddingBottom: appSpacing.xs,
  },
  checkoutButton: {
    minHeight: 56,
    borderRadius: appRadii.xl,
    backgroundColor: appColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: appSpacing.sm,
    paddingHorizontal: appSpacing.md,
    overflow: 'hidden',
  },
  checkoutButtonPressed: {
    opacity: 0.92,
  },
  checkoutLabel: {
    ...appTypography.headlineSm,
    color: appColors.onPrimary,
    flexShrink: 1,
  },
  sosHintText: {
    ...appTypography.labelLg,
    color: appColors.onSurfaceVariant,
    textAlign: 'center',
  },
});
