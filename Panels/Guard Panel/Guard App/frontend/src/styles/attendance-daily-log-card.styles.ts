import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const attendanceDailyLogCardStyles = StyleSheet.create({
  card: {
    backgroundColor: appColors.surfaceContainerLowest,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    gap: appSpacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  cardOff: {
    backgroundColor: appColors.surfaceContainerLow,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: appSpacing.xs,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: appRadii.full,
  },
  statusOnDuty: {
    backgroundColor: appColors.primaryFixed,
  },
  statusPresent: {
    backgroundColor: appColors.surfaceContainerHigh,
  },
  statusOff: {
    backgroundColor: appColors.surfaceContainerHighest,
  },
  statusText: {
    ...appTypography.labelLg,
    fontFamily: 'PublicSans_700Bold',
    letterSpacing: 0.4,
  },
  statusTextOnDuty: {
    color: appColors.onPrimaryFixed,
  },
  statusTextPresent: {
    color: appColors.primary,
  },
  statusTextOff: {
    color: appColors.secondary,
  },
  dateLabel: {
    ...appTypography.labelLg,
    color: appColors.secondary,
  },
  postRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  postLabel: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
    flex: 1,
  },
  detailsBox: {
    backgroundColor: appColors.surfaceContainerLow,
    borderRadius: appRadii.lg,
    padding: appSpacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: appSpacing.sm,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    ...appTypography.labelLg,
    color: appColors.secondary,
  },
  detailValue: {
    ...appTypography.labelXl,
    color: appColors.onSurface,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: appSpacing.xs,
  },
  footerTag: {
    ...appTypography.labelLg,
    color: appColors.secondary,
    backgroundColor: appColors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: appRadii.sm,
    overflow: 'hidden',
  },
});
