import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const patrolCaptureSuccessToastStyles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: appSpacing.md,
    left: appSpacing.gutter,
    right: appSpacing.gutter,
    padding: appSpacing.md,
    borderRadius: appRadii.xl,
    backgroundColor: appColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 40,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...appTypography.titleLg,
    color: appColors.onPrimary,
  },
  subtitle: {
    ...appTypography.bodyLg,
    color: appColors.onPrimaryContainer,
  },
});
