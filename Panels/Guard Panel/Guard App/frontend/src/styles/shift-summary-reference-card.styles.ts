import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const shiftSummaryReferenceCardStyles = StyleSheet.create({
  card: {
    backgroundColor: appColors.surfaceContainerLowest,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  spine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 8,
    backgroundColor: appColors.primary,
  },
  content: {
    paddingLeft: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: appSpacing.xs,
  },
  referenceLabel: {
    ...appTypography.labelLg,
    color: appColors.onSurfaceVariant,
  },
  referenceValue: {
    ...appTypography.headlineSm,
    color: appColors.onSurface,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: appColors.primaryFixed,
    borderRadius: appRadii.full,
  },
  statusText: {
    ...appTypography.labelLg,
    color: appColors.onPrimaryFixed,
  },
  dutyTitle: {
    marginTop: appSpacing.md,
    fontFamily: 'PublicSans_800ExtraBold',
    fontSize: 28,
    lineHeight: 36,
    color: appColors.onSurface,
    letterSpacing: -0.4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.xs,
    marginTop: 4,
  },
  metaText: {
    ...appTypography.bodyXl,
    color: appColors.onSurfaceVariant,
  },
  metaTextStrong: {
    ...appTypography.bodyXl,
    color: appColors.onSurface,
    fontFamily: 'PublicSans_600SemiBold',
  },
  checkedInRow: {
    marginTop: appSpacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: appSpacing.sm,
    padding: appSpacing.sm,
    backgroundColor: appColors.surfaceContainer,
    borderRadius: appRadii.lg,
  },
  checkedInLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  checkedInLabel: {
    ...appTypography.labelLg,
    color: appColors.onSurface,
  },
  checkedInTime: {
    ...appTypography.labelLg,
    color: appColors.primary,
    fontFamily: 'PublicSans_700Bold',
  },
  earlyBadge: {
    ...appTypography.labelLg,
    color: appColors.onSurfaceVariant,
    backgroundColor: appColors.surfaceContainerLowest,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: appRadii.sm,
    overflow: 'hidden',
  },
});
