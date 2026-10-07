import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const incomingCompletedHandoversStyles = StyleSheet.create({
  section: {
    gap: appSpacing.sm,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    ...appTypography.headlineSm,
    color: appColors.onSurface,
    flexShrink: 1,
  },
  month: {
    ...appTypography.labelLg,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.primary,
  },
  card: {
    backgroundColor: appColors.surfaceContainerLowest,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    gap: appSpacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  approvalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 4,
  },
  approvalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: appRadii.full,
    backgroundColor: appColors.primaryFixed,
  },
  approvalText: {
    ...appTypography.labelLg,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onPrimaryFixed,
  },
  date: {
    ...appTypography.bodyLg,
    color: appColors.onSurfaceVariant,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 4,
  },
  detailCopy: {
    flex: 1,
    minWidth: 0,
  },
  coverTitle: {
    ...appTypography.titleLg,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onSurface,
  },
  siteMeta: {
    ...appTypography.bodyLg,
    color: appColors.onSurfaceVariant,
  },
  payBlock: {
    alignItems: 'flex-end',
  },
  payAmount: {
    ...appTypography.labelXl,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.primary,
  },
  paySub: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'PublicSans_400Regular',
    color: appColors.onSurfaceVariant,
  },
  timesheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  timesheetText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'PublicSans_400Regular',
    color: appColors.onSurfaceVariant,
    flex: 1,
  },
});
