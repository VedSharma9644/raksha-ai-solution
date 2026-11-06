import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const attendanceGuardProfileSummaryStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.md,
    backgroundColor: appColors.surfaceContainerLow,
    borderRadius: appRadii.lg,
    padding: appSpacing.sm,
    marginBottom: appSpacing.md,
  },
  photoWrap: {
    width: 64,
    height: 64,
    borderRadius: appRadii.lg,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 70, 74, 0.1)',
  },
  verifiedRibbon: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: appColors.primary,
    paddingVertical: 2,
    alignItems: 'center',
  },
  verifiedText: {
    ...appTypography.labelLg,
    fontSize: 10,
    lineHeight: 12,
    color: appColors.onPrimary,
    fontFamily: 'PublicSans_700Bold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
  },
  guardId: {
    ...appTypography.labelLg,
    color: appColors.onSurfaceVariant,
  },
  dutyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dutyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: appColors.primary,
  },
  dutyLabel: {
    ...appTypography.labelLg,
    color: appColors.primary,
    fontFamily: 'PublicSans_700Bold',
  },
});
