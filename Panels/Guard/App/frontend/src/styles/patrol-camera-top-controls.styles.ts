import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const patrolCameraTopControlsStyles = StyleSheet.create({
  section: {
    padding: appSpacing.md,
    gap: appSpacing.sm,
    zIndex: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.xs,
    paddingHorizontal: appSpacing.md,
    paddingVertical: appSpacing.xs,
    borderRadius: appRadii.full,
    backgroundColor: 'rgba(33, 49, 69, 0.6)',
  },
  cancelButtonPressed: {
    backgroundColor: 'rgba(33, 49, 69, 0.8)',
  },
  cancelLabel: {
    ...appTypography.labelLg,
    color: appColors.inverseOnSurface,
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.xs,
  },
  roundIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(33, 49, 69, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundIconButtonPressed: {
    backgroundColor: 'rgba(33, 49, 69, 0.8)',
  },
});
