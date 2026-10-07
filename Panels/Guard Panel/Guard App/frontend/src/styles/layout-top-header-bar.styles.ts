import { StyleSheet } from 'react-native';

import { appColors, appLayout, appSpacing, appTypography } from '../theme';

export const layoutTopHeaderBarStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
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
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.sm,
  },
  logo: {
    width: 32,
    height: 32,
  },
  brand: {
    ...appTypography.headlineSm,
    color: appColors.primary,
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  subtitle: {
    ...appTypography.labelLg,
    color: appColors.secondary,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPressed: {
    backgroundColor: appColors.surfaceContainerHigh,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: appColors.tertiaryContainer,
    borderWidth: 2,
    borderColor: appColors.surface,
  },
  avatarWrap: {
    width: 32,
    height: 32,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: appColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPhoto: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(0, 70, 74, 0.2)',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: appColors.primary,
    borderWidth: 2,
    borderColor: appColors.surface,
  },
});
