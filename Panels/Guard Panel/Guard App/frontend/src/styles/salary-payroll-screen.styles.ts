import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const salaryPayrollScreenStyles = StyleSheet.create({
  content: {
    gap: appSpacing.md,
    paddingTop: appSpacing.sm,
  },
  heroCard: {
    backgroundColor: appColors.primary,
    borderRadius: appRadii.xl,
    padding: appSpacing.lg,
    gap: appSpacing.xs,
  },
  heroLabel: {
    ...appTypography.labelLg,
    color: appColors.onPrimaryContainer,
  },
  heroAmount: {
    ...appTypography.displayLg,
    color: appColors.onPrimary,
    fontSize: 36,
    lineHeight: 44,
  },
  heroPeriod: {
    ...appTypography.bodyLg,
    color: appColors.primaryFixed,
    marginTop: appSpacing.xs,
  },
  disclaimer: {
    ...appTypography.labelLg,
    color: appColors.onPrimaryContainer,
    marginTop: appSpacing.sm,
    lineHeight: 18,
  },
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
  cardTitle: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: appSpacing.sm,
    paddingVertical: 4,
  },
  rowLabel: {
    ...appTypography.bodyLg,
    color: appColors.onSurfaceVariant,
    flex: 1,
  },
  rowValue: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
    flexShrink: 0,
    textAlign: 'right',
  },
  rowValueMuted: {
    color: appColors.secondary,
  },
  rowValueDeduct: {
    color: appColors.error,
  },
  divider: {
    height: 1,
    backgroundColor: appColors.outlineVariant,
    marginVertical: 4,
  },
  netRow: {
    marginTop: 2,
  },
  netLabel: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
    flex: 1,
  },
  netValue: {
    ...appTypography.headlineSm,
    color: appColors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: appSpacing.sm,
  },
  statCell: {
    width: '30%',
    flexGrow: 1,
    backgroundColor: appColors.surfaceContainerLow,
    borderRadius: appRadii.lg,
    paddingVertical: appSpacing.sm,
    paddingHorizontal: appSpacing.xs,
    alignItems: 'center',
  },
  statValue: {
    ...appTypography.headlineSm,
    color: appColors.primary,
  },
  statLabel: {
    ...appTypography.labelLg,
    color: appColors.secondary,
    textAlign: 'center',
    marginTop: 2,
  },
  emptyNote: {
    ...appTypography.bodyLg,
    color: appColors.onSurfaceVariant,
    textAlign: 'center',
    paddingVertical: appSpacing.lg,
  },
  centered: {
    paddingTop: 40,
    alignItems: 'center',
    gap: appSpacing.sm,
  },
  loadingText: {
    ...appTypography.bodyLg,
    color: appColors.secondary,
  },
  errorText: {
    ...appTypography.bodyLg,
    color: appColors.error,
    textAlign: 'center',
    paddingHorizontal: appSpacing.md,
  },
  retryButton: {
    marginTop: appSpacing.sm,
    backgroundColor: appColors.primary,
    borderRadius: appRadii.lg,
    paddingHorizontal: appSpacing.lg,
    paddingVertical: appSpacing.sm,
  },
  retryLabel: {
    ...appTypography.titleLg,
    color: appColors.onPrimary,
  },
  deductionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: appSpacing.sm,
    paddingVertical: 4,
  },
  deductionCopy: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    gap: 2,
  },
  deductionPurpose: {
    ...appTypography.bodyLg,
    color: appColors.onSurface,
  },
  deductionAmount: {
    ...appTypography.titleLg,
    color: appColors.error,
    flexShrink: 0,
    textAlign: 'right',
  },
  deductionMeta: {
    ...appTypography.labelLg,
    color: appColors.secondary,
  },
});
