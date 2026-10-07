import { StyleSheet } from 'react-native';

import { appSpacing } from '../theme';

export const leaveTimeOffScreenStyles = StyleSheet.create({
  content: {
    gap: appSpacing.md,
    paddingTop: appSpacing.sm,
  },
  cardsList: {
    gap: appSpacing.md,
  },
  urgentWrap: {
    marginTop: appSpacing.sm,
  },
});
