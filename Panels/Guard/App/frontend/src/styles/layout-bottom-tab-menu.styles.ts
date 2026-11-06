import { StyleSheet } from 'react-native';

import { appColors, appLayout, appSpacing, appTypography, isCompact } from '../theme';

export const layoutBottomTabMenuStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: 'rgba(248, 249, 255, 0.96)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(191, 200, 201, 0.55)',
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
    minWidth: 0,
    minHeight: appLayout.bottomNavHeight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 2,
  },
  label: {
    ...appTypography.labelLg,
    fontSize: isCompact ? 11 : appTypography.labelLg.fontSize,
    lineHeight: isCompact ? 14 : appTypography.labelLg.lineHeight,
    textAlign: 'center',
  },
  labelActive: {
    fontFamily: 'PublicSans_700Bold',
  },
});
