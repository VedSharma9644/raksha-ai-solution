import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const leaveDutyCoverNoticeStyles = StyleSheet.create({
  card: {
    backgroundColor: appColors.surfaceContainerLow,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: appSpacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: appColors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...appTypography.labelLg,
    color: appColors.onSurface,
  },
  message: {
    ...appTypography.bodyLg,
    fontSize: 14,
    lineHeight: 20,
    color: appColors.onSurfaceVariant,
    marginTop: 2,
  },
  emphasis: {
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onSurface,
  },
});
