import { StyleSheet } from 'react-native';

import { appColors, appSpacing, contentMaxWidth } from '../theme';

export const layoutScreenShellStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: appColors.surface,
  },
  scroll: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: contentMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: appSpacing.gutter,
    gap: appSpacing.md,
  },
});
