import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const notificationsScreenStyles = StyleSheet.create({
  root: {
    gap: appSpacing.md,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: appSpacing.sm,
  },
  toolbarLabel: {
    ...appTypography.labelLg,
    color: appColors.secondary,
    flex: 1,
  },
  markAllButton: {
    paddingHorizontal: appSpacing.md,
    paddingVertical: appSpacing.sm,
    borderRadius: appRadii.md,
    backgroundColor: appColors.surfaceContainerHigh,
  },
  markAllButtonPressed: {
    opacity: 0.85,
  },
  markAllText: {
    ...appTypography.labelLg,
    color: appColors.primary,
  },
  markAllTextDisabled: {
    color: appColors.onSurfaceVariant,
  },
  emptyWrap: {
    paddingVertical: appSpacing.xl,
    alignItems: 'center',
    gap: appSpacing.sm,
  },
  emptyTitle: {
    ...appTypography.headlineSm,
    color: appColors.onSurface,
  },
  emptyBody: {
    ...appTypography.bodyLg,
    color: appColors.secondary,
    textAlign: 'center',
    paddingHorizontal: appSpacing.lg,
  },
  list: {
    gap: appSpacing.sm,
  },
  card: {
    backgroundColor: appColors.surface,
    borderRadius: appRadii.lg,
    padding: appSpacing.md,
    borderWidth: 1,
    borderColor: appColors.outlineVariant,
    gap: appSpacing.xs,
  },
  cardUnread: {
    borderColor: 'rgba(0, 70, 74, 0.28)',
    backgroundColor: 'rgba(0, 70, 74, 0.04)',
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.surfaceContainerHigh,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.xs,
  },
  title: {
    ...appTypography.labelXl,
    color: appColors.onSurface,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: appColors.primary,
  },
  time: {
    ...appTypography.labelLg,
    color: appColors.secondary,
    fontSize: 12,
    lineHeight: 16,
  },
  body: {
    ...appTypography.bodyLg,
    fontSize: 15,
    lineHeight: 22,
    color: appColors.onSurfaceVariant,
    paddingLeft: 44,
  },
  loadingWrap: {
    paddingVertical: appSpacing.xl,
    alignItems: 'center',
  },
});
