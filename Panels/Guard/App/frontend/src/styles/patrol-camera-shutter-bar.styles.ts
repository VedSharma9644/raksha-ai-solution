import { StyleSheet } from 'react-native';

import { appColors, appSpacing, appTypography } from '../theme';

export const patrolCameraShutterBarStyles = StyleSheet.create({
  bar: {
    backgroundColor: appColors.inverseSurface,
    paddingHorizontal: appSpacing.gutter,
    paddingTop: appSpacing.md,
    paddingBottom: appSpacing.lg,
    alignItems: 'center',
    zIndex: 10,
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: appColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  shutterOuterPressed: {
    transform: [{ scale: 0.95 }],
  },
  pulseRing: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: 'rgba(149, 209, 214, 0.6)',
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: appColors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    ...appTypography.labelLg,
    color: appColors.inverseOnSurface,
    marginTop: appSpacing.sm,
  },
});
