import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const attendanceMonthCalendarOverviewStyles = StyleSheet.create({
  card: {
    backgroundColor: appColors.surfaceContainerLowest,
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
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  weekLabel: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    ...appTypography.labelLg,
    color: appColors.secondary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPresent: {
    backgroundColor: appColors.surfaceContainerHigh,
  },
  dayHalf: {
    backgroundColor: '#e8b86d',
  },
  dayMissed: {
    backgroundColor: appColors.errorContainer,
  },
  dayUpcoming: {
    backgroundColor: appColors.primaryFixed,
  },
  dayToday: {
    backgroundColor: appColors.primary,
  },
  dayOff: {
    backgroundColor: appColors.surfaceContainerLow,
  },
  dayLeave: {
    backgroundColor: appColors.outlineVariant,
  },
  dayText: {
    ...appTypography.labelLg,
    color: appColors.onSurface,
  },
  dayTextToday: {
    color: appColors.onPrimary,
    fontFamily: 'PublicSans_700Bold',
  },
  dayTextMissed: {
    color: appColors.onErrorContainer,
    fontFamily: 'PublicSans_700Bold',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: appSpacing.sm,
    marginTop: appSpacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...appTypography.labelLg,
    color: appColors.secondary,
  },
});
