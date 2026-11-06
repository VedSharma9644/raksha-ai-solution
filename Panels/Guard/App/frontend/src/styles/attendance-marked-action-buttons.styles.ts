import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const attendanceMarkedActionButtonsStyles = StyleSheet.create({
  section: {
    gap: appSpacing.sm,
    paddingBottom: appSpacing.lg,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: appRadii.lg,
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
    transform: [{ scale: 0.98 }],
  },
  primaryLabel: {
    ...appTypography.labelXl,
    color: appColors.onPrimary,
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    borderRadius: appRadii.lg,
    backgroundColor: appColors.surfaceContainerHigh,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  secondaryButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  secondaryLabel: {
    ...appTypography.labelXl,
    color: appColors.onSurface,
  },
});
