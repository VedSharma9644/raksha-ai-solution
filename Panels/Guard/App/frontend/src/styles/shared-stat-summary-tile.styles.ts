import { StyleSheet } from 'react-native';

import {
  appColors,
  appRadii,
  appSpacing,
  appTypography,
  fontScale,
  isCompact,
  twoColumnTileWidth,
} from '../theme';

const tileWidth = twoColumnTileWidth({
  horizontalGutter: appSpacing.gutter,
  gap: appSpacing.sm,
});

export const sharedStatSummaryTileStyles = StyleSheet.create({
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
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: appRadii.lg,
    backgroundColor: appColors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: appSpacing.sm,
  },
  value: {
    fontFamily: 'PublicSans_800ExtraBold',
    fontSize: fontScale(isCompact ? 26 : 30),
    lineHeight: fontScale(isCompact ? 32 : 36),
    color: appColors.onSurface,
  },
  label: {
    ...appTypography.labelLg,
    color: appColors.onSurface,
    marginTop: 2,
  },
  subtitle: {
    ...appTypography.labelLg,
    color: appColors.secondary,
    marginTop: 2,
  },
});
