import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const intervalCheckinBannerStyles = StyleSheet.create({
  card: {
    borderRadius: appRadii.lg,
    padding: appSpacing.md,
    gap: appSpacing.sm,
    borderWidth: 1,
  },
  cardDue: {
    backgroundColor: '#fff7ed',
    borderColor: '#fdba74',
  },
  cardLate: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  cardMissed: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  cardWaiting: {
    backgroundColor: '#f0fdfa',
    borderColor: '#99f6e4',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: appSpacing.sm,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...appTypography.titleSmall,
    color: appColors.onSurface,
    fontFamily: 'PublicSans_700Bold',
  },
  body: {
    ...appTypography.bodySmall,
    color: appColors.onSurfaceVariant,
  },
  meta: {
    ...appTypography.labelSmall,
    color: appColors.onSurfaceVariant,
  },
});
