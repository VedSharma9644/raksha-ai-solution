import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const relieveGuardPickerStyles = StyleSheet.create({
  section: {
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: appSpacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: appColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    ...appTypography.labelLg,
    color: appColors.onPrimary,
    fontFamily: 'PublicSans_700Bold',
  },
  stepTitle: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
    flexShrink: 1,
  },
  clusterLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'PublicSans_600SemiBold',
    color: appColors.onSurfaceVariant,
  },
  hint: {
    ...appTypography.bodyLg,
    color: appColors.onSurfaceVariant,
    marginBottom: 4,
  },
  list: {
    gap: appSpacing.sm,
  },
  guardCard: {
    backgroundColor: appColors.surfaceContainerLowest,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: appSpacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
    overflow: 'hidden',
  },
  guardCardSelected: {
    backgroundColor: appColors.surfaceContainerHigh,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSelected: {
    backgroundColor: appColors.primaryContainer,
  },
  avatarIdle: {
    backgroundColor: appColors.surfaceContainerHighest,
  },
  avatarText: {
    ...appTypography.headlineSm,
    fontFamily: 'PublicSans_700Bold',
  },
  avatarTextSelected: {
    color: appColors.onPrimary,
  },
  avatarTextIdle: {
    color: appColors.onSurface,
  },
  checkDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: appColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guardCopy: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  guardName: {
    ...appTypography.labelXl,
    color: appColors.onSurface,
    fontFamily: 'PublicSans_700Bold',
    flex: 1,
  },
  guardMeta: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'PublicSans_600SemiBold',
    color: appColors.onSurfaceVariant,
    marginBottom: 6,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: appRadii.full,
  },
  badgeAvailable: {
    backgroundColor: appColors.surfaceContainer,
  },
  badgeNeutral: {
    backgroundColor: appColors.surfaceContainer,
  },
  badgeSecondary: {
    backgroundColor: appColors.secondaryContainer,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: appColors.primary,
  },
  badgeTextAvailable: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.primary,
  },
  badgeTextNeutral: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onSurfaceVariant,
  },
  badgeTextSecondary: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'PublicSans_600SemiBold',
    color: appColors.onSecondaryContainer,
  },
  broadcastButton: {
    marginTop: 4,
    minHeight: 52,
    borderRadius: appRadii.xl,
    backgroundColor: appColors.surfaceContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: appSpacing.md,
  },
  broadcastPressed: {
    backgroundColor: appColors.surfaceContainerHigh,
    opacity: 0.95,
  },
  broadcastLabel: {
    ...appTypography.labelLg,
    color: appColors.onSurface,
    flexShrink: 1,
    textAlign: 'center',
  },
});
