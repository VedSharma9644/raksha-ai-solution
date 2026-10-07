import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const sharedWeekSegmentTabsStyles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
    backgroundColor: appColors.surfaceContainerHigh,
    borderRadius: appRadii.xl,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: appSpacing.xs,
    paddingVertical: 12,
    borderRadius: appRadii.lg,
  },
  tabActive: {
    backgroundColor: appColors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  tabLabel: {
    ...appTypography.labelXl,
    color: appColors.secondary,
  },
  tabLabelActive: {
    color: appColors.primary,
  },
});
