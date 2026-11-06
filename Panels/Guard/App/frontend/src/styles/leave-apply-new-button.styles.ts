import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const leaveApplyNewButtonStyles = StyleSheet.create({
  button: {
    minHeight: 58,
    backgroundColor: appColors.primaryContainer,
    borderRadius: appRadii.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: appSpacing.xs,
    paddingHorizontal: appSpacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  label: {
    ...appTypography.labelXl,
    color: appColors.onPrimary,
    letterSpacing: 0.3,
  },
});
