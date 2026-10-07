import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const incomingReliefRosterBarStyles = StyleSheet.create({
  bar: {
    marginHorizontal: -appSpacing.margin,
    paddingHorizontal: appSpacing.md,
    paddingVertical: appSpacing.sm,
    backgroundColor: appColors.surfaceContainerLow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: appSpacing.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.xs,
    flex: 1,
    minWidth: 0,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: appColors.primaryContainer,
  },
  rosterText: {
    ...appTypography.labelLg,
    color: appColors.onSurface,
    flexShrink: 1,
  },
  rosterName: {
    fontFamily: 'PublicSans_700Bold',
  },
  postChip: {
    backgroundColor: 'rgba(177, 237, 243, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: appRadii.full,
  },
  postText: {
    ...appTypography.labelLg,
    color: appColors.primary,
    fontFamily: 'PublicSans_700Bold',
  },
});
