import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing } from '../theme';

export const attendanceMarkedDetailsCardStyles = StyleSheet.create({
  card: {
    backgroundColor: appColors.surfaceContainerLowest,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    marginBottom: appSpacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  rows: {
    gap: appSpacing.sm,
  },
});
