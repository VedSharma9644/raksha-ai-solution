import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const attendanceLogFilterTabsStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: appSpacing.xs,
  },
  tab: {
    paddingHorizontal: appSpacing.sm,
    paddingVertical: 8,
    borderRadius: appRadii.full,
    backgroundColor: appColors.surfaceContainerHigh,
  },
  tabActive: {
    backgroundColor: appColors.primaryContainer,
  },
  tabLabel: {
    ...appTypography.labelLg,
    color: appColors.secondary,
  },
  tabLabelActive: {
    color: appColors.onPrimary,
    fontFamily: 'PublicSans_700Bold',
  },
});
