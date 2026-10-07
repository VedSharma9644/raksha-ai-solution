import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const patrolOfficialPunchWatermarkStyles = StyleSheet.create({
  section: {
    paddingHorizontal: appSpacing.gutter,
    paddingBottom: appSpacing.sm,
    gap: 4,
    zIndex: 10,
  },
  card: {
    padding: appSpacing.sm,
    borderRadius: appRadii.lg,
    backgroundColor: 'rgba(33, 49, 69, 0.8)',
    gap: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: appSpacing.xs,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  timestamp: {
    ...appTypography.labelLg,
    color: appColors.inverseOnSurface,
    fontFamily: 'PublicSans_700Bold',
    flexShrink: 1,
  },
  punchBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: appRadii.sm,
    backgroundColor: appColors.primary,
  },
  punchBadgeText: {
    ...appTypography.labelLg,
    color: appColors.onPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    ...appTypography.bodyLg,
    fontSize: 13,
    lineHeight: 16,
    color: appColors.surfaceDim,
    flex: 1,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  securityText: {
    ...appTypography.bodyLg,
    fontSize: 12,
    lineHeight: 14,
    color: appColors.secondaryFixed,
    textAlign: 'center',
  },
});
