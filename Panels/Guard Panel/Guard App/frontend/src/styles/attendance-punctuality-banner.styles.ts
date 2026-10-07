import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const attendancePunctualityBannerStyles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.sm,
    backgroundColor: appColors.primaryContainer,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...appTypography.titleLg,
    color: appColors.onPrimary,
    fontFamily: 'PublicSans_700Bold',
  },
  subtitle: {
    ...appTypography.labelLg,
    color: appColors.onPrimaryContainer,
    marginTop: 2,
  },
});
