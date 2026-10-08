import { StyleSheet } from 'react-native';

import {
  appColors,
  appRadii,
  appSpacing,
  appTypography,
  isCompact,
  twoColumnTileWidth,
} from '../theme';

const tileWidth = twoColumnTileWidth({
  horizontalGutter: appSpacing.gutter,
  gap: appSpacing.sm,
});

export const sharedIconActionTileStyles = StyleSheet.create({
  tile: {
    width: tileWidth,
    backgroundColor: appColors.surfaceContainerLowest,
    borderRadius: appRadii.xl,
    padding: isCompact ? appSpacing.sm : appSpacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  tilePressed: {
    backgroundColor: appColors.surfaceContainerLow,
  },
  iconWrap: {
    width: isCompact ? 40 : 48,
    height: isCompact ? 40 : 48,
    borderRadius: appRadii.lg,
    backgroundColor: appColors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: appSpacing.sm,
  },
  title: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
  },
  subtitle: {
    ...appTypography.labelLg,
    color: appColors.secondary,
    marginTop: 4,
  },
});
