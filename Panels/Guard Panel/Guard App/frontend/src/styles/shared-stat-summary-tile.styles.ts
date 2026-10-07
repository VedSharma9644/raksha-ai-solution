import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const sharedStatSummaryTileStyles = StyleSheet.create({
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
    fontSize: 32,
    lineHeight: 38,
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
