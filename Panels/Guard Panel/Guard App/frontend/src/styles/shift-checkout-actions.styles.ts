import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const shiftCheckoutActionsStyles = StyleSheet.create({
  section: {
    gap: appSpacing.sm,
    paddingTop: appSpacing.sm,
  },
  checkoutButton: {
    height: 64,
    borderRadius: appRadii.xl,
    backgroundColor: appColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: appSpacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  checkoutButtonPressed: {
    transform: [{ translateY: 2 }],
  },
  checkoutLabel: {
    ...appTypography.headlineSm,
    color: appColors.onPrimary,
  },
  sosHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  sosHintText: {
    ...appTypography.labelLg,
    color: appColors.tertiary,
    fontFamily: 'PublicSans_700Bold',
    letterSpacing: 0.4,
    textAlign: 'center',
    flexShrink: 1,
  },
});
