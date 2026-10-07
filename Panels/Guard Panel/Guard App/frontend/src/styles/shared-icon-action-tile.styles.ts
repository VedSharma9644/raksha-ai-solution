import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const sharedIconActionTileStyles = StyleSheet.create({
  tile: {
    width: '48%',
    flexGrow: 1,
    minWidth: '46%',
    backgroundColor: appColors.surfaceContainerLowest,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
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
    width: 48,
    height: 48,
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
