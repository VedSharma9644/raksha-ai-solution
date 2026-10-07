import { StyleSheet } from 'react-native';

import { appSpacing } from '../theme';

export const attendanceStatsGridStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: appSpacing.sm,
  },
});
