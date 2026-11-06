import { StyleSheet } from 'react-native';

import { appColors } from '../theme';

export const appStartupLoadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.surface,
  },
});
