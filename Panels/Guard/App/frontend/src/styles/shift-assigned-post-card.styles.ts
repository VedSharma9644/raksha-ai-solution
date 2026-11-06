import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const shiftAssignedPostCardStyles = StyleSheet.create({
  card: {
    backgroundColor: appColors.surfaceContainerLowest,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
  },
  siteName: {
    ...appTypography.headlineSm,
    color: appColors.onSurface,
  },
  siteAddress: {
    ...appTypography.bodyLg,
    color: appColors.onSurfaceVariant,
  },
  checkpointBox: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: appSpacing.sm,
    backgroundColor: appColors.surfaceContainer,
    borderRadius: appRadii.lg,
  },
  checkpointTitle: {
    ...appTypography.bodyXl,
    color: appColors.onSurface,
    fontFamily: 'PublicSans_600SemiBold',
    flex: 1,
    minWidth: 0,
  },
});
