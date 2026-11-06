import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const shiftSummaryReferenceCardStyles = StyleSheet.create({
  card: {
    backgroundColor: appColors.surfaceContainerLowest,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  spine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: appColors.primary,
  },
  content: {
    paddingLeft: 10,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: appSpacing.sm,
  },
  todayLabel: {
    ...appTypography.labelLg,
    color: appColors.onSurfaceVariant,
    flexShrink: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: appColors.primaryFixed,
    borderRadius: appRadii.full,
    flexShrink: 0,
  },
  statusText: {
    ...appTypography.labelLg,
    color: appColors.onPrimaryFixed,
    fontFamily: 'PublicSans_700Bold',
  },
  dutyTitle: {
    fontFamily: 'PublicSans_800ExtraBold',
    fontSize: 24,
    lineHeight: 30,
    color: appColors.onSurface,
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.xs,
  },
  metaTextStrong: {
    ...appTypography.bodyXl,
    color: appColors.onSurface,
    fontFamily: 'PublicSans_600SemiBold',
    flexShrink: 1,
  },
  checkedInRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: appSpacing.sm,
    backgroundColor: appColors.surfaceContainer,
    borderRadius: appRadii.lg,
  },
  checkedInLabel: {
    ...appTypography.labelLg,
    color: appColors.onSurface,
    flex: 1,
    minWidth: 0,
  },
  checkedInTime: {
    ...appTypography.labelLg,
    color: appColors.primary,
    fontFamily: 'PublicSans_700Bold',
  },
});
