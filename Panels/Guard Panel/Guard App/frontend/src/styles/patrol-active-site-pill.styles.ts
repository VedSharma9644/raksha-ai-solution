import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const patrolActiveSitePillStyles = StyleSheet.create({
  pill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.xs,
    paddingHorizontal: appSpacing.md,
    paddingVertical: appSpacing.xs,
    borderRadius: appRadii.full,
    backgroundColor: 'rgba(0, 70, 74, 0.8)',
    maxWidth: '100%',
  },
  label: {
    ...appTypography.labelLg,
    color: appColors.onPrimary,
    flexShrink: 1,
  },
});
