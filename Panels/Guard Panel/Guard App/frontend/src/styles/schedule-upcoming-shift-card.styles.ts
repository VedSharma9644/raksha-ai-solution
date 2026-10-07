import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const scheduleUpcomingShiftCardStyles = StyleSheet.create({
  card: {
    backgroundColor: appColors.surfaceContainerLowest,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    gap: appSpacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  restCard: {
    backgroundColor: appColors.surfaceContainerLow,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: appSpacing.xs,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  tomorrowBadge: {
    backgroundColor: appColors.primaryFixed,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: appRadii.full,
  },
  tomorrowText: {
    ...appTypography.labelLg,
    color: appColors.onPrimaryFixed,
    fontFamily: 'PublicSans_700Bold',
  },
  dayLabel: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
    flexShrink: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: appColors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: appRadii.md,
  },
  statusBadgeNight: {
    backgroundColor: appColors.surfaceContainerHigh,
  },
  statusBadgeRest: {
    backgroundColor: appColors.surfaceContainerHighest,
    borderRadius: appRadii.full,
    paddingHorizontal: 10,
  },
  statusText: {
    ...appTypography.labelLg,
    color: appColors.primary,
    fontFamily: 'PublicSans_700Bold',
  },
  statusTextNight: {
    color: appColors.onSurface,
  },
  siteBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: appSpacing.sm,
  },
  siteCol: {
    flex: 1,
    minWidth: 0,
  },
  siteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  siteName: {
    ...appTypography.bodyXl,
    color: appColors.onSurface,
    fontFamily: 'PublicSans_600SemiBold',
    flexShrink: 1,
  },
  postName: {
    ...appTypography.bodyLg,
    color: appColors.onSurfaceVariant,
    marginLeft: 24,
  },
  allowanceChip: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(30, 94, 99, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: appRadii.lg,
  },
  allowanceText: {
    ...appTypography.labelLg,
    color: appColors.primaryContainer,
    fontFamily: 'PublicSans_700Bold',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    gap: appSpacing.xs,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  timeText: {
    ...appTypography.labelLg,
    color: appColors.secondary,
    flexShrink: 1,
  },
  restBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.sm,
    marginVertical: 4,
  },
  restIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: appColors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restTitle: {
    ...appTypography.bodyXl,
    color: appColors.onSurface,
    fontFamily: 'PublicSans_700Bold',
  },
  restMessage: {
    ...appTypography.bodyLg,
    color: appColors.onSurfaceVariant,
  },
});
