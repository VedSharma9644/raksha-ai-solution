import { StyleSheet } from 'react-native';

import { appColors, appLayout, appSpacing, appTypography } from '../theme';

export const layoutBackNavigationHeaderStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'rgba(248, 249, 255, 0.92)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  bar: {
    height: appLayout.headerHeight,
    paddingHorizontal: appSpacing.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.sm,
    flex: 1,
    minWidth: 0,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    backgroundColor: appColors.surfaceContainerHigh,
  },
  logo: {
    width: 32,
    height: 32,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    paddingLeft: 4,
  },
  brandEyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
    flexShrink: 1,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: appColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profilePhoto: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(0, 70, 74, 0.2)',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.xs,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: appColors.tertiaryContainer,
    borderWidth: 2,
    borderColor: appColors.surface,
  },
});
