import { StyleSheet } from 'react-native';

import { appColors, appRadii, appTypography } from '../theme';

export const sharedStatusPillStyles = StyleSheet.create({
  base: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: appRadii.full,
  },
  label: {
    ...appTypography.labelLg,
    fontFamily: 'PublicSans_700Bold',
  },
  primarySoft: {
    backgroundColor: appColors.surfaceContainerHighest,
  },
  primarySoftLabel: {
    color: appColors.primary,
  },
  idBadge: {
    backgroundColor: appColors.surfaceContainerHigh,
    paddingHorizontal: 8,
  },
});
