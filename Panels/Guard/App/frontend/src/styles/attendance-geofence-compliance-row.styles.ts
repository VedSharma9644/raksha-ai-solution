import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const attendanceGeofenceComplianceRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: appColors.surfaceContainerHigh,
    borderRadius: appRadii.lg,
    padding: appSpacing.sm,
    gap: appSpacing.sm,
    flexWrap: 'wrap',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: appSpacing.sm,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '60%',
    minWidth: 0,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: appColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...appTypography.labelLg,
    color: appColors.onSurface,
  },
  detail: {
    ...appTypography.bodyLg,
    color: appColors.onSurfaceVariant,
  },
  result: {
    ...appTypography.labelLg,
    color: appColors.primary,
    fontFamily: 'PublicSans_700Bold',
    flexShrink: 0,
  },
});
