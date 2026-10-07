import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const shiftGpsLiveBannerStyles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: appSpacing.md,
    paddingVertical: appSpacing.sm,
    backgroundColor: appColors.surfaceContainerHigh,
    borderRadius: appRadii.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.sm,
    flex: 1,
    minWidth: 0,
  },
  liveDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: appColors.primary,
  },
  liveLabel: {
    ...appTypography.labelLg,
    color: appColors.onSurface,
    flexShrink: 1,
  },
  signalLabel: {
    ...appTypography.labelLg,
    color: appColors.onSurfaceVariant,
    fontFamily: 'PublicSans_700Bold',
  },
});
