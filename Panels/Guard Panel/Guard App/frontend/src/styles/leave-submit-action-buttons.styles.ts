import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const leaveSubmitActionButtonsStyles = StyleSheet.create({
  section: {
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    height: 60,
    borderRadius: appRadii.xl,
    backgroundColor: appColors.primaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  primaryButtonSuccess: {
    backgroundColor: appColors.primary,
  },
  primaryLabel: {
    ...appTypography.labelXl,
    color: appColors.onPrimary,
  },
  secondaryButton: {
    paddingVertical: 12,
    borderRadius: appRadii.xl,
    backgroundColor: appColors.surfaceContainerLowest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  secondaryButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  secondaryLabel: {
    ...appTypography.labelLg,
    color: appColors.onSurface,
  },
  urgentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
    flexWrap: 'wrap',
  },
  urgentText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'PublicSans_600SemiBold',
    color: appColors.secondary,
    textAlign: 'center',
  },
  urgentLink: {
    color: appColors.primary,
    fontFamily: 'PublicSans_700Bold',
    textDecorationLine: 'underline',
  },
});
