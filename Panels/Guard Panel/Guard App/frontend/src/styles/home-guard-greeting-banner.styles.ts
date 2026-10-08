import { StyleSheet } from 'react-native';

import { appColors, appSpacing, appTypography } from '../theme';

export const homeGuardGreetingBannerStyles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: appSpacing.sm,
    marginBottom: appSpacing.xs,
  },
  greetingCol: {
    flex: 1,
    minWidth: 0,
  },
  greeting: {
    ...appTypography.headlineSm,
    color: appColors.onSurface,
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: appSpacing.xs,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  dot: {
    ...appTypography.labelLg,
    color: appColors.secondary,
    fontFamily: 'PublicSans_700Bold',
    flexShrink: 0,
  },
  post: {
    ...appTypography.labelLg,
    color: appColors.onSurfaceVariant,
    fontFamily: 'PublicSans_700Bold',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '40%',
    minWidth: 0,
  },
  photoWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
});
