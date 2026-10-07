import { StyleSheet } from 'react-native';

import { appColors, appSpacing } from '../theme';

export const layoutStackScrollScreenStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: appColors.surface,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: appSpacing.gutter,
    gap: appSpacing.md,
  },
});
