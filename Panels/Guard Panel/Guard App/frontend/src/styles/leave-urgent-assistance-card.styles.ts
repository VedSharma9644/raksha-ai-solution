import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const leaveUrgentAssistanceCardStyles = StyleSheet.create({
  card: {
    backgroundColor: appColors.surfaceContainerLow,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.xs,
    marginBottom: appSpacing.xs,
  },
  title: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
    flex: 1,
  },
  message: {
    ...appTypography.bodyLg,
    color: appColors.secondary,
    lineHeight: 22,
    marginBottom: appSpacing.md,
  },
  callButton: {
    minHeight: 52,
    backgroundColor: appColors.surfaceContainerHighest,
    borderRadius: appRadii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: appSpacing.xs,
  },
  callButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  callLabel: {
    ...appTypography.labelXl,
    color: appColors.onSurface,
  },
});
