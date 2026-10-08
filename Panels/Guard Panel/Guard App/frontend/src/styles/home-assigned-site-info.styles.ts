import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const homeAssignedSiteInfoStyles = StyleSheet.create({
  siteCard: {
    backgroundColor: appColors.surfaceContainerLow,
    borderRadius: appRadii.lg,
    padding: appSpacing.sm,
    marginTop: appSpacing.xs,
    gap: appSpacing.xs,
  },
  siteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: appSpacing.xs,
  },
  siteTextCol: {
    flex: 1,
    minWidth: 0,
  },
  siteName: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
  },
  siteDetail: {
    ...appTypography.labelLg,
    color: appColors.secondary,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 4,
    gap: appSpacing.xs,
    flexWrap: 'wrap',
  },
  callChip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: appColors.surfaceContainerHighest,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: appRadii.full,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '55%',
    minWidth: 0,
  },
  callChipPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  callText: {
    ...appTypography.labelLg,
    color: appColors.primary,
    fontFamily: 'PublicSans_700Bold',
    flexShrink: 1,
    flex: 1,
    minWidth: 0,
  },
  gpsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: appColors.surfaceContainerLowest,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: appRadii.full,
    flexShrink: 0,
  },
  gpsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: appColors.primary,
  },
  gpsText: {
    ...appTypography.labelLg,
    color: appColors.primary,
    fontFamily: 'PublicSans_700Bold',
  },
});
