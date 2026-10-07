import { StyleSheet } from 'react-native';

import { appColors, appSpacing, appTypography } from '../theme';

export const homeTodayShiftStatusStyles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 8,
    backgroundColor: appColors.primary,
  },
  content: {
    paddingLeft: 8,
    gap: appSpacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: appSpacing.xs,
  },
  shiftLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.xs,
    flexShrink: 1,
  },
  shiftLabel: {
    ...appTypography.labelLg,
    color: appColors.primary,
    fontFamily: 'PublicSans_700Bold',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    flexShrink: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: appSpacing.xs,
    flexWrap: 'wrap',
  },
  time: {
    ...appTypography.headlineSm,
    color: appColors.onSurface,
  },
  duration: {
    ...appTypography.labelLg,
    color: appColors.secondary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    gap: appSpacing.xs,
    flexWrap: 'wrap',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  statusMuted: {
    ...appTypography.bodyLg,
    color: appColors.secondary,
  },
  statusValue: {
    ...appTypography.bodyLg,
    color: appColors.onSurface,
    fontFamily: 'PublicSans_700Bold',
  },
  countdown: {
    ...appTypography.labelLg,
    color: appColors.primary,
    fontFamily: 'PublicSans_700Bold',
  },
});
