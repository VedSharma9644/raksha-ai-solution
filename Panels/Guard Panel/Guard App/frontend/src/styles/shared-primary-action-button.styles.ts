import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const sharedPrimaryActionButtonStyles = StyleSheet.create({
  base: {
    width: '100%',
    height: 56,
    borderRadius: appRadii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: appSpacing.xs,
  },
  light: {
    backgroundColor: appColors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lightPressed: {
    backgroundColor: appColors.surfaceContainerLow,
    transform: [{ scale: 0.98 }],
  },
  lightLabel: {
    ...appTypography.labelXl,
    color: appColors.primary,
  },
  emergency: {
    backgroundColor: appColors.tertiaryContainer,
  },
  emergencyPressed: {
    backgroundColor: appColors.tertiary,
  },
  emergencyLabel: {
    ...appTypography.labelXl,
    color: appColors.onTertiary,
  },
});
