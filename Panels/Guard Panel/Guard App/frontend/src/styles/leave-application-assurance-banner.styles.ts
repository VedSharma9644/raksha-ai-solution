import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const leaveApplicationAssuranceBannerStyles = StyleSheet.create({
  banner: {
    backgroundColor: appColors.primaryContainer,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: appSpacing.sm,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: appRadii.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  title: {
    ...appTypography.headlineSm,
    color: appColors.onPrimary,
  },
  badge: {
    backgroundColor: appColors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: appRadii.full,
  },
  badgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.primary,
  },
  message: {
    ...appTypography.bodyLg,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  blob: {
    position: 'absolute',
    right: -16,
    bottom: -16,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});
