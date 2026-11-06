import { StyleSheet } from 'react-native';

import { appSpacing } from '../theme';

export const homeDutyQuickActionsStyles = StyleSheet.create({
  section: {
    gap: appSpacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: appSpacing.sm,
  },
});
