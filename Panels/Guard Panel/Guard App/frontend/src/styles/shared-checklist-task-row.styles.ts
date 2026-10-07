import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const sharedChecklistTaskRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: appSpacing.sm,
    borderRadius: appRadii.xl,
    gap: appSpacing.sm,
  },
  rowDone: {
    backgroundColor: appColors.surfaceContainer,
  },
  rowPending: {
    backgroundColor: appColors.surfaceContainerLow,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: appColors.outlineVariant,
    backgroundColor: appColors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    borderColor: appColors.primary,
    backgroundColor: appColors.primary,
  },
  title: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
  },
  subtitle: {
    ...appTypography.bodyLg,
    color: appColors.onSurfaceVariant,
  },
  subtitleHighlight: {
    ...appTypography.bodyLg,
    color: appColors.primary,
    fontFamily: 'PublicSans_700Bold',
  },
});
