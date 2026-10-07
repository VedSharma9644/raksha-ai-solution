import { StyleSheet } from 'react-native';

import { appColors, appRadii } from '../theme';

export const patrolCameraViewportStyles = StyleSheet.create({
  viewport: {
    flex: 1,
    borderRadius: appRadii.xl,
    overflow: 'hidden',
    backgroundColor: appColors.inverseSurface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  previewImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
  },
  captureFlash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: appColors.surfaceContainerLowest,
    zIndex: 30,
  },
  layeredContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
});
