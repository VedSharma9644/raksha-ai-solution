import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const incomingEmergencySupportCardStyles = StyleSheet.create({
  card: {
    backgroundColor: appColors.surfaceContainerLow,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    gap: appSpacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: appColors.tertiaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
    flex: 1,
  },
  message: {
    ...appTypography.bodyLg,
    color: appColors.onSurfaceVariant,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
  },
  actionButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: appRadii.lg,
    backgroundColor: appColors.surfaceContainerLowest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  supervisorLabel: {
    ...appTypography.labelLg,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onSurface,
  },
  tollFreeLabel: {
    ...appTypography.labelLg,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.tertiary,
  },
  pressed: {
    backgroundColor: appColors.surfaceContainer,
  },
});
