import { StyleSheet } from 'react-native';

import { appColors, appTypography } from '../theme';

export const sharedTextChevronLinkStyles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  label: {
    ...appTypography.labelLg,
    color: appColors.primary,
    fontFamily: 'PublicSans_700Bold',
  },
});
