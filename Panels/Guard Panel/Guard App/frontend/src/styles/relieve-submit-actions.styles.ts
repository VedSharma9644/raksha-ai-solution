import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const relieveSubmitActionsStyles = StyleSheet.create({
  section: {
    gap: appSpacing.sm,
    paddingTop: appSpacing.sm,
  },
  primaryButton: {
    minHeight: 64,
    borderRadius: appRadii.xl,
    backgroundColor: appColors.primaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: appSpacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonSuccess: {
    backgroundColor: appColors.primary,
  },
  primaryButtonPressed: {
    opacity: 0.92,
    transform: [{ translateY: 1 }],
  },
  primaryLabel: {
    ...appTypography.labelXl,
    color: appColors.onPrimary,
    letterSpacing: 0.3,
  },
  historyButton: {
    minHeight: 52,
    borderRadius: appRadii.xl,
    backgroundColor: appColors.surfaceContainerLow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: appSpacing.md,
  },
  historyButtonPressed: {
    backgroundColor: appColors.surfaceContainer,
  },
  historyLabel: {
    ...appTypography.labelLg,
    color: appColors.onSurface,
  },
  toast: {
    marginTop: appSpacing.sm,
    backgroundColor: appColors.inverseSurface,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  toastCopy: {
    flex: 1,
    minWidth: 0,
  },
  toastTitle: {
    ...appTypography.labelLg,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.inverseOnSurface,
  },
  toastMessage: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'PublicSans_400Regular',
    color: appColors.surfaceContainerHigh,
  },
});
