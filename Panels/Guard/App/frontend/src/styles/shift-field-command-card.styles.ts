import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const shiftFieldCommandCardStyles = StyleSheet.create({
  card: {
    backgroundColor: appColors.surfaceContainerLowest,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.sm,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  label: {
    ...appTypography.labelLg,
    color: appColors.onSurfaceVariant,
  },
  name: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
  },
  phone: {
    ...appTypography.bodyLg,
    color: appColors.onSurface,
    fontFamily: 'PublicSans_500Medium',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: appColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: appRadii.lg,
    flexShrink: 0,
  },
  callPressed: {
    opacity: 0.9,
  },
  callLabel: {
    ...appTypography.labelXl,
    color: appColors.onPrimary,
  },
});
