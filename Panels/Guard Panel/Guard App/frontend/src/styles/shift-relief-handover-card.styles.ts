import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const shiftReliefHandoverCardStyles = StyleSheet.create({
  card: {
    backgroundColor: appColors.surfaceContainerLowest,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    gap: appSpacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.xs,
  },
  headerTitle: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
  },
  squadLabel: {
    ...appTypography.labelLg,
    color: appColors.onSurfaceVariant,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.sm,
    padding: appSpacing.sm,
    backgroundColor: appColors.surfaceContainer,
    borderRadius: appRadii.xl,
  },
  photo: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
  },
  guardId: {
    ...appTypography.labelLg,
    color: appColors.onSurfaceVariant,
  },
  reliefWindow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  reliefWindowText: {
    ...appTypography.bodyLg,
    color: appColors.primary,
    fontFamily: 'PublicSans_700Bold',
  },
  requestButton: {
    height: 56,
    borderRadius: appRadii.xl,
    backgroundColor: appColors.secondaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  requestButtonPressed: {
    transform: [{ scale: 0.97 }],
  },
  requestButtonText: {
    ...appTypography.labelXl,
    color: appColors.onSecondaryContainer,
  },
});
