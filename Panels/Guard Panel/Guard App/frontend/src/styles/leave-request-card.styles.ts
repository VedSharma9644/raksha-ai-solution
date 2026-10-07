import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const leaveRequestCardStyles = StyleSheet.create({
  card: {
    backgroundColor: appColors.surfaceContainerLowest,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  statusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
  },
  statusBarPending: {
    backgroundColor: '#f59e0b',
  },
  statusBarApproved: {
    backgroundColor: '#059669',
  },
  statusBarRejected: {
    backgroundColor: appColors.error,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: appSpacing.xs,
    paddingTop: 4,
    marginBottom: appSpacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: appSpacing.sm,
    paddingVertical: 4,
    borderRadius: appRadii.full,
  },
  statusBadgePending: {
    backgroundColor: '#fef3c7',
  },
  statusBadgeApproved: {
    backgroundColor: '#d1fae5',
  },
  statusBadgeRejected: {
    backgroundColor: appColors.errorContainer,
  },
  statusBadgeText: {
    ...appTypography.labelLg,
    fontFamily: 'PublicSans_700Bold',
  },
  statusBadgeTextPending: {
    color: '#78350f',
  },
  statusBadgeTextApproved: {
    color: '#064e3b',
  },
  statusBadgeTextRejected: {
    color: appColors.onErrorContainer,
  },
  duration: {
    ...appTypography.labelLg,
    color: appColors.secondary,
  },
  dateBlock: {
    marginBottom: appSpacing.xs,
  },
  dateRange: {
    ...appTypography.headlineSm,
    color: appColors.onSurface,
  },
  leaveType: {
    ...appTypography.labelLg,
    color: appColors.primary,
    fontFamily: 'PublicSans_600SemiBold',
    marginTop: 2,
  },
  leaveTypeMuted: {
    color: appColors.secondary,
  },
  reasonBlock: {
    backgroundColor: appColors.surfaceContainerLow,
    borderRadius: appRadii.lg,
    padding: appSpacing.sm,
    marginBottom: appSpacing.sm,
  },
  reasonBlockAlt: {
    backgroundColor: appColors.surfaceContainerHigh,
  },
  reasonLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  reasonLabelAlt: {
    color: appColors.onSurfaceVariant,
  },
  reasonText: {
    ...appTypography.bodyLg,
    color: appColors.onSurface,
    fontFamily: 'PublicSans_500Medium',
  },
  metaBlock: {
    gap: 4,
    marginBottom: appSpacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    ...appTypography.bodyLg,
    color: appColors.secondary,
    flex: 1,
  },
  metaTextStrong: {
    ...appTypography.labelLg,
    color: appColors.onSurface,
    flex: 1,
  },
  approvalBlock: {
    backgroundColor: '#ecfdf5',
    borderRadius: appRadii.lg,
    padding: appSpacing.sm,
    gap: 4,
  },
  approvalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  approvalNote: {
    ...appTypography.labelLg,
    color: '#064e3b',
    flex: 1,
  },
  approvalDetail: {
    ...appTypography.bodyLg,
    color: '#065f46',
  },
  approvalSimpleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  approvalSimpleText: {
    ...appTypography.bodyLg,
    color: appColors.secondary,
    flex: 1,
  },
  compensationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: appColors.surfaceContainerLow,
    borderRadius: appRadii.lg,
    padding: appSpacing.sm,
  },
  compensationText: {
    ...appTypography.labelLg,
    color: appColors.onSurface,
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: appSpacing.sm,
    paddingTop: appSpacing.xs,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: appRadii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: appSpacing.sm,
  },
  withdrawButton: {
    backgroundColor: appColors.surfaceContainerHigh,
  },
  withdrawLabel: {
    ...appTypography.labelLg,
    color: appColors.tertiary,
  },
  callButton: {
    backgroundColor: appColors.primaryContainer,
  },
  callLabel: {
    ...appTypography.labelLg,
    color: appColors.onPrimary,
  },
  actionPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
});
