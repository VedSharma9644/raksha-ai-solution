import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const incomingReliefIncentiveBannerStyles = StyleSheet.create({
  card: {
    backgroundColor: appColors.surfaceContainerHigh,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: appSpacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: appRadii.xl,
    backgroundColor: appColors.primaryContainer,
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
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  title: {
    ...appTypography.labelLg,
    color: appColors.primary,
    fontFamily: 'PublicSans_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  rateBadge: {
    backgroundColor: appColors.surfaceContainerLowest,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: appRadii.sm,
  },
  rateText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onSurface,
  },
  message: {
    ...appTypography.bodyLg,
    color: appColors.onSurfaceVariant,
  },
});
