import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const incomingReliefRequestsScreenStyles = StyleSheet.create({
  content: {
    gap: appSpacing.md,
    paddingTop: 0,
  },
  feed: {
    gap: appSpacing.md,
  },
  toast: {
    backgroundColor: appColors.inverseSurface,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  toastMessage: {
    ...appTypography.bodyLg,
    color: appColors.inverseOnSurface,
    flex: 1,
  },
});
