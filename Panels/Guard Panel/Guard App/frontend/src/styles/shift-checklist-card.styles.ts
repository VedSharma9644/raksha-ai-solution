import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const shiftChecklistCardStyles = StyleSheet.create({
  card: {
    backgroundColor: appColors.surfaceContainerLowest,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    gap: appSpacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.xs,
  },
  headerTitle: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
  },
  counter: {
    ...appTypography.labelLg,
    color: appColors.onSurface,
    fontFamily: 'PublicSans_700Bold',
    backgroundColor: appColors.surfaceContainerHigh,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: appRadii.full,
    overflow: 'hidden',
  },
  intro: {
    ...appTypography.bodyLg,
    color: appColors.onSurfaceVariant,
  },
  list: {
    gap: appSpacing.xs,
  },
});
