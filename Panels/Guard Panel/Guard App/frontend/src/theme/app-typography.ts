import { fontScale } from './responsive';

export const appTypography = {
  displayLg: {
    fontFamily: 'PublicSans_800ExtraBold',
    fontSize: fontScale(32),
    lineHeight: fontScale(40),
  },
  headlineSm: {
    fontFamily: 'PublicSans_700Bold',
    fontSize: fontScale(20),
    lineHeight: fontScale(26),
  },
  titleLg: {
    fontFamily: 'PublicSans_600SemiBold',
    fontSize: fontScale(18),
    lineHeight: fontScale(24),
  },
  bodyXl: {
    fontFamily: 'PublicSans_500Medium',
    fontSize: fontScale(17),
    lineHeight: fontScale(24),
  },
  bodyLg: {
    fontFamily: 'PublicSans_400Regular',
    fontSize: fontScale(16),
    lineHeight: fontScale(22),
  },
  labelXl: {
    fontFamily: 'PublicSans_700Bold',
    fontSize: fontScale(16),
    lineHeight: fontScale(22),
  },
  labelLg: {
    fontFamily: 'PublicSans_600SemiBold',
    fontSize: fontScale(13),
    lineHeight: fontScale(18),
  },
} as const;
