import { StyleSheet } from 'react-native';

import { appColors, appTypography } from '../theme';

export const sharedSectionHeadingStyles = StyleSheet.create({
  title: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
  },
});
