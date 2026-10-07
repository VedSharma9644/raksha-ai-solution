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
    alignItems: 'center',
    gap: appSpacing.xs,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  dot: {
    ...appTypography.labelLg,
    color: appColors.secondary,
    fontFamily: 'PublicSans_700Bold',
  },
  post: {
    ...appTypography.labelLg,
    color: appColors.onSurfaceVariant,
    fontFamily: 'PublicSans_700Bold',
  },
  photoWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: appColors.surfaceContainer,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
});
