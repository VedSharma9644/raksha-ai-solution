import { StyleSheet } from 'react-native';

import { appColors, appLayout, appRadii, appSpacing, appTypography } from '../theme';

export const layoutBottomTabMenuStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: 'rgba(248, 249, 255, 0.92)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  row: {
    height: appLayout.bottomNavHeight,
    paddingHorizontal: appSpacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    ...appTypography.labelLg,
  },
  labelActive: {
    fontFamily: 'PublicSans_700Bold',
  },
  homeIndicatorWrap: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  homeIndicator: {
    width: 128,
    height: 4,
    borderRadius: appRadii.full,
    backgroundColor: 'rgba(191, 200, 201, 0.6)',
  },
});
