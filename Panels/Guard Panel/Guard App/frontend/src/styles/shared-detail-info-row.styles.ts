import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const sharedDetailInfoRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: appSpacing.sm,
    backgroundColor: appColors.surfaceContainerLow,
    borderRadius: appRadii.lg,
    padding: appSpacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: appRadii.lg,
    backgroundColor: appColors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    ...appTypography.labelLg,
    color: appColors.onSurfaceVariant,
  },
  title: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
  },
  headlineTitle: {
    ...appTypography.headlineSm,
    color: appColors.onSurface,
  },
  subtitle: {
    ...appTypography.bodyLg,
    color: appColors.onSurfaceVariant,
  },
  inlineBadge: {
    backgroundColor: appColors.primaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: appRadii.full,
    marginLeft: 4,
  },
  inlineBadgeText: {
    ...appTypography.labelLg,
    color: appColors.primary,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
});
