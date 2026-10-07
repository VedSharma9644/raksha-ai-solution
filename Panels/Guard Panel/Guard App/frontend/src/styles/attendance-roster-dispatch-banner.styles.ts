import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const attendanceRosterDispatchBannerStyles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: appSpacing.sm,
    backgroundColor: appColors.surfaceContainerHigh,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    marginBottom: appSpacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  title: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
  },
  message: {
    ...appTypography.bodyLg,
    color: appColors.onSurfaceVariant,
    marginTop: 2,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
});
