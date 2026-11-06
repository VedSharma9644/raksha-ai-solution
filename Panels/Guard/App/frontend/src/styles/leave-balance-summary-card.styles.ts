import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const leaveBalanceSummaryCardStyles = StyleSheet.create({
  card: {
    backgroundColor: appColors.surfaceContainerLowest,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
    gap: appSpacing.sm,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: appSpacing.sm,
  },
  headingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.xs,
    flex: 1,
    minWidth: 0,
  },
  heading: {
    ...appTypography.labelLg,
    color: appColors.onSurface,
    flexShrink: 1,
  },
  updated: {
    ...appTypography.bodyLg,
    fontSize: 14,
    lineHeight: 20,
    color: appColors.secondary,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: appColors.surfaceContainerLow,
    borderRadius: appRadii.lg,
    padding: appSpacing.sm,
    gap: appSpacing.xs,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: appSpacing.xs,
    paddingHorizontal: 4,
  },
  statCellHighlighted: {
    backgroundColor: appColors.surfaceContainerLowest,
    borderRadius: appRadii.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    ...appTypography.displayLg,
    color: appColors.primary,
    lineHeight: 40,
  },
  statValueMuted: {
    color: appColors.secondary,
  },
  statValuePending: {
    color: appColors.tertiaryContainer,
  },
  statLabel: {
    ...appTypography.labelLg,
    color: appColors.onSurface,
    textAlign: 'center',
  },
  statLabelPending: {
    color: appColors.tertiaryContainer,
  },
  statSub: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'PublicSans_500Medium',
    color: appColors.secondary,
    marginTop: 2,
    textAlign: 'center',
  },
  payrollBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: appSpacing.xs,
    backgroundColor: appColors.surfaceContainerHigh,
    borderRadius: appRadii.lg,
    padding: appSpacing.sm,
  },
  payrollIcon: {
    marginTop: 2,
  },
  payrollText: {
    ...appTypography.bodyLg,
    color: appColors.onSurface,
    lineHeight: 22,
    flex: 1,
  },
});
