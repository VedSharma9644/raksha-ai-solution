import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const incomingSentRequestCardStyles = StyleSheet.create({
  card: {
    backgroundColor: appColors.surfaceContainerLowest,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    gap: appSpacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: appRadii.full,
    backgroundColor: appColors.secondaryFixed,
  },
  statusText: {
    ...appTypography.labelLg,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onSecondaryFixed,
  },
  sentAgo: {
    ...appTypography.labelLg,
    color: appColors.onSurfaceVariant,
  },
  title: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
  },
  shiftMeta: {
    ...appTypography.bodyLg,
    color: appColors.onSurfaceVariant,
  },
  broadcastBox: {
    backgroundColor: appColors.surfaceContainerLow,
    borderRadius: appRadii.lg,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  broadcastLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  broadcastText: {
    ...appTypography.bodyLg,
    color: appColors.onSurface,
    flexShrink: 1,
  },
  activeLabel: {
    ...appTypography.labelLg,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.primary,
  },
  withdrawButton: {
    minHeight: 48,
    borderRadius: appRadii.lg,
    backgroundColor: appColors.errorContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 4,
  },
  withdrawLabel: {
    ...appTypography.labelLg,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onErrorContainer,
  },
  pressed: {
    opacity: 0.85,
  },
});
