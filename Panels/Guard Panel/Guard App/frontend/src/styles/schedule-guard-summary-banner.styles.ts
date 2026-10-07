import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const scheduleGuardSummaryBannerStyles = StyleSheet.create({
  section: {
    backgroundColor: appColors.surfaceContainerLow,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.sm,
    flex: 1,
    minWidth: 0,
  },
  initials: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: appColors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    ...appTypography.labelXl,
    color: appColors.onPrimary,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.xs,
    flexWrap: 'wrap',
  },
  name: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
  },
  idBadge: {
    backgroundColor: appColors.surfaceContainerHigh,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: appRadii.full,
  },
  idText: {
    ...appTypography.labelLg,
    color: appColors.primary,
  },
  prompt: {
    ...appTypography.labelLg,
    color: appColors.secondary,
  },
  badgeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: appColors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statPill: {
    marginTop: appSpacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.xs,
    backgroundColor: 'rgba(211, 228, 254, 0.8)',
    paddingHorizontal: appSpacing.sm,
    paddingVertical: 8,
    borderRadius: appRadii.lg,
    flexWrap: 'wrap',
  },
  statBold: {
    ...appTypography.labelLg,
    color: appColors.onSurface,
    fontFamily: 'PublicSans_700Bold',
  },
  statMuted: {
    ...appTypography.labelLg,
    color: appColors.secondary,
  },
  dot: {
    ...appTypography.labelLg,
    color: appColors.outlineVariant,
  },
});
