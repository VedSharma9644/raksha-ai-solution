import { StyleSheet } from 'react-native';

import { appColors, appSpacing } from '../theme';

export const patrolSessionScreenStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: appColors.surface,
  },
  content: {
    flex: 1,
    paddingHorizontal: appSpacing.gutter,
    paddingBottom: appSpacing.xl,
  },
});
