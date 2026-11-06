import { StyleSheet } from 'react-native';

import { appColors, appSpacing } from '../theme';

export const patrolSessionScreenStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: appColors.surface,
  },
  content: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: appSpacing.gutter,
    paddingBottom: appSpacing.md,
  },
});
