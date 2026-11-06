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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: appSpacing.xs,
    flexWrap: 'wrap',
  },
  shiftLabelRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: appSpacing.xs,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '55%',
    minWidth: 0,
  },
  shiftLabel: {
    ...appTypography.labelLg,
    color: appColors.primary,
    fontFamily: 'PublicSans_700Bold',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    flexShrink: 1,
    flex: 1,
    minWidth: 0,
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 4,
    gap: appSpacing.xs,
    flexWrap: 'wrap',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '60%',
    minWidth: 0,
    flexWrap: 'wrap',
  },
  statusMuted: {
    ...appTypography.bodyLg,
    color: appColors.secondary,
  },
  statusValue: {
    ...appTypography.bodyLg,
    color: appColors.onSurface,
    fontFamily: 'PublicSans_700Bold',
    flexShrink: 1,
    flex: 1,
    minWidth: 0,
  },
  countdown: {
    ...appTypography.labelLg,
    color: appColors.primary,
    fontFamily: 'PublicSans_700Bold',
    flexShrink: 0,
  },
});
