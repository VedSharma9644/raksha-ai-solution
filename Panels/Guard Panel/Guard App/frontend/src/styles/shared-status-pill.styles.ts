import { StyleSheet } from 'react-native';

import { appColors, appRadii, appTypography } from '../theme';

export const sharedStatusPillStyles = StyleSheet.create({
  base: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: appRadii.full,
    flexShrink: 0,
    maxWidth: '100%',
  },
  label: {
    ...appTypography.labelLg,
    fontFamily: 'PublicSans_700Bold',
  },
  primarySoft: {
    backgroundColor: appColors.surfaceContainerHighest,
  },
  primarySoftLabel: {
    color: appColors.primary,
  },
  idBadge: {
    backgroundColor: appColors.surfaceContainerHigh,
    paddingHorizontal: 8,
  },
  warning: {
    backgroundColor: 'rgba(180, 83, 9, 0.14)',
  },
  warningLabel: {
    color: '#b45309',
  },
  danger: {
    backgroundColor: appColors.errorContainer,
  },
  dangerLabel: {
    color: appColors.onErrorContainer,
  },
  success: {
    backgroundColor: 'rgba(6, 95, 70, 0.12)',
  },
  successLabel: {
    color: '#065f46',
  },
});

