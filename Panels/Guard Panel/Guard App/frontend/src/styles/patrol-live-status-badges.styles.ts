import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const patrolLiveStatusBadgesStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: appSpacing.xs,
    marginTop: appSpacing.md,
    paddingHorizontal: appSpacing.gutter,
  },
  faceDetected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: appSpacing.sm,
    paddingVertical: 4,
    borderRadius: appRadii.full,
    backgroundColor: appColors.primaryContainer,
  },
  faceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: appColors.primaryFixed,
  },
  faceLabel: {
    ...appTypography.labelLg,
    color: appColors.onPrimaryContainer,
  },
  geofence: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: appSpacing.sm,
    paddingVertical: 4,
    borderRadius: appRadii.full,
    backgroundColor: 'rgba(220, 233, 255, 0.9)',
  },
  geofenceLabel: {
    ...appTypography.labelLg,
    color: appColors.onSurface,
  },
});
