import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const attendanceMarkedSuccessHeroStyles = StyleSheet.create({
  section: {
    alignItems: 'center',
    paddingTop: appSpacing.xs,
    paddingBottom: appSpacing.md,
  },
  iconCluster: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: appSpacing.sm,
    width: 96,
    height: 96,
  },
  pingRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(177, 237, 243, 0.4)',
    opacity: 0.4,
  },
  verifiedCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: appColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  shiftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: appSpacing.sm,
    paddingVertical: 4,
    borderRadius: appRadii.full,
    backgroundColor: appColors.primaryFixed,
    marginBottom: appSpacing.xs,
  },
  shiftBadgeText: {
    ...appTypography.labelLg,
    color: appColors.onPrimaryFixed,
    fontFamily: 'PublicSans_700Bold',
  },
  title: {
    ...appTypography.headlineSm,
    fontSize: 28,
    lineHeight: 36,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    ...appTypography.bodyLg,
    color: appColors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 2,
  },
});
