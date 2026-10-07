import { StyleSheet } from 'react-native';

import { appColors, appSpacing, appTypography } from '../theme';

export const scheduleUpcomingListHeaderStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: appSpacing.xs,
    paddingHorizontal: 4,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    ...appTypography.headlineSm,
    color: appColors.onSurface,
  },
  subtitle: {
    ...appTypography.labelLg,
    color: appColors.secondary,
  },
});
