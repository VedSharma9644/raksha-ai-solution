import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const attendanceMonthCycleSelectorStyles = StyleSheet.create({
  card: {
    backgroundColor: appColors.surfaceContainerLowest,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: appColors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    ...appTypography.headlineSm,
    color: appColors.onSurface,
  },
  cycleLabel: {
    ...appTypography.labelLg,
    color: appColors.primary,
    marginTop: appSpacing.sm,
  },
  cycleNote: {
    ...appTypography.labelLg,
    color: appColors.secondary,
    marginTop: 2,
  },
});
