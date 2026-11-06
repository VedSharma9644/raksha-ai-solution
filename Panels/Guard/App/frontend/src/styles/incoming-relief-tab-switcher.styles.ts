import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const incomingReliefTabSwitcherStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    padding: 6,
    backgroundColor: appColors.surfaceContainer,
    borderRadius: appRadii.xl,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: appRadii.lg,
  },
  tabActive: {
    backgroundColor: appColors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  tabLabel: {
    ...appTypography.labelXl,
    color: appColors.secondary,
    flexShrink: 1,
  },
  tabLabelActive: {
    color: appColors.onSurface,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: appRadii.full,
  },
  badgeIncoming: {
    backgroundColor: appColors.tertiaryContainer,
  },
  badgeSent: {
    backgroundColor: appColors.secondaryContainer,
  },
  badgeTextIncoming: {
    fontSize: 12,
    lineHeight: 14,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onTertiary,
  },
  badgeTextSent: {
    fontSize: 12,
    lineHeight: 14,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onSecondaryContainer,
  },
});
