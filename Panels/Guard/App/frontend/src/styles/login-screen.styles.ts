import { StyleSheet } from 'react-native';

import { appColors, appSpacing, contentMaxWidth, isCompact, ms } from '../theme';

export const loginScreenStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: appColors.surface,
  },
  scroll: {
    flexGrow: 1,
  },
  main: {
    width: '100%',
    maxWidth: contentMaxWidth,
    alignSelf: 'center',
    flex: 1,
    paddingHorizontal: appSpacing.gutter,
    marginTop: isCompact ? -16 : -24,
    zIndex: 2,
    paddingBottom: ms(24),
  },
});
