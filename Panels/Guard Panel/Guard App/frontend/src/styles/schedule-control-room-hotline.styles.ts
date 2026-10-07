import { StyleSheet } from 'react-native';

import { appColors, appSpacing, appTypography } from '../theme';

export const scheduleControlRoomHotlineStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: appSpacing.sm,
    flexWrap: 'wrap',
  },
  label: {
    ...appTypography.labelLg,
    color: appColors.secondary,
  },
  phone: {
    ...appTypography.labelLg,
    color: appColors.primary,
    fontFamily: 'PublicSans_700Bold',
  },
});
