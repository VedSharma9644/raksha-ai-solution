import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const patrolFaceAlignmentGuideStyles = StyleSheet.create({
  section: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: appSpacing.gutter,
    zIndex: 10,
  },
  frame: {
    width: 256,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  promptBox: {
    alignItems: 'center',
    paddingHorizontal: appSpacing.md,
    paddingVertical: appSpacing.xs,
    borderRadius: appRadii.xl,
    backgroundColor: 'rgba(33, 49, 69, 0.5)',
  },
  promptText: {
    ...appTypography.labelLg,
    color: appColors.inverseOnSurface,
    marginTop: 4,
    textAlign: 'center',
  },
});
