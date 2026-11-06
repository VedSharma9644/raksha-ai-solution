import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const leaveRequestFilterTabsStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: appSpacing.xs,
    paddingBottom: appSpacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: appSpacing.md,
    paddingVertical: 8,
    borderRadius: appRadii.full,
    backgroundColor: appColors.surfaceContainerHigh,
  },
  tabActive: {
    backgroundColor: appColors.primaryContainer,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  tabLabel: {
    ...appTypography.labelLg,
    color: appColors.onSurface,
  },
  tabLabelActive: {
    color: appColors.onPrimary,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: appRadii.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeNeutral: {
    backgroundColor: appColors.surfaceContainerLowest,
  },
  badgeNeutralActive: {
    backgroundColor: appColors.surfaceContainerLowest,
  },
  badgePending: {
    backgroundColor: '#f59e0b',
  },
  badgeApproved: {
    backgroundColor: '#059669',
  },
  badgeRejected: {
    backgroundColor: appColors.secondary,
  },
  badgeText: {
    fontSize: 12,
    lineHeight: 14,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onPrimary,
  },
  badgeTextNeutral: {
    color: appColors.primary,
  },
});
