import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const shiftAssignedPostCardStyles = StyleSheet.create({
  card: {
    backgroundColor: appColors.surfaceContainerLowest,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    gap: appSpacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: appSpacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.xs,
  },
  headerTitle: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
  },
  perimeterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: appColors.surfaceContainerHigh,
    borderRadius: appRadii.full,
  },
  perimeterText: {
    fontFamily: 'PublicSans_700Bold',
    fontSize: 13,
    lineHeight: 16,
    color: appColors.onSurface,
  },
  mapPreview: {
    height: 144,
    borderRadius: appRadii.xl,
    overflow: 'hidden',
    backgroundColor: appColors.inverseSurface,
    justifyContent: 'flex-end',
    padding: appSpacing.sm,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFill,
  },
  mapFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: appSpacing.xs,
    zIndex: 1,
  },
  radiusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  radiusText: {
    ...appTypography.labelLg,
    color: appColors.inverseOnSurface,
    flexShrink: 1,
  },
  gpsTagged: {
    ...appTypography.labelLg,
    color: appColors.inverseOnSurface,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: appRadii.sm,
    overflow: 'hidden',
  },
  siteName: {
    ...appTypography.headlineSm,
    color: appColors.onSurface,
  },
  siteAddress: {
    ...appTypography.bodyLg,
    color: appColors.onSurfaceVariant,
    marginTop: 4,
  },
  checkpointBox: {
    marginTop: 8,
    padding: appSpacing.sm,
    backgroundColor: appColors.surfaceContainer,
    borderRadius: appRadii.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkpointTitle: {
    ...appTypography.labelLg,
    color: appColors.onSurface,
    fontFamily: 'PublicSans_700Bold',
  },
  checkpointSubtitle: {
    ...appTypography.bodyLg,
    color: appColors.onSurfaceVariant,
  },
  actions: {
    flexDirection: 'row',
    gap: appSpacing.sm,
  },
  secondaryAction: {
    flex: 1,
    height: 56,
    borderRadius: appRadii.xl,
    backgroundColor: appColors.surfaceContainerHigh,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryActionPressed: {
    transform: [{ scale: 0.97 }],
  },
  secondaryActionText: {
    ...appTypography.labelLg,
    color: appColors.onSurface,
  },
});
