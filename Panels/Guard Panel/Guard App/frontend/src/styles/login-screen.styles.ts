import { StyleSheet } from 'react-native';

import { appColors, appSpacing } from '../theme';

export const loginScreenStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: appColors.surface,
  },
  scroll: {
    flexGrow: 1,
  },
  main: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -24,
    zIndex: 2,
  },
});
