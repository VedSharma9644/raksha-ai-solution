import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const scheduleShiftReliefRequestStyles = StyleSheet.create({
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: appSpacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: appColors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
  },
  message: {
    ...appTypography.bodyLg,
    color: appColors.onSurfaceVariant,
    lineHeight: 22,
  },
  button: {
    minHeight: 56,
    borderRadius: appRadii.xl,
    backgroundColor: appColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonPressed: {
    backgroundColor: appColors.primaryContainer,
    transform: [{ scale: 0.99 }],
  },
  buttonText: {
    ...appTypography.labelXl,
    color: appColors.onPrimary,
  },
});
