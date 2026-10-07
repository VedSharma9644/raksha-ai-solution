import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing } from '../theme';

export const sharedRaisedCardStyles = StyleSheet.create({
  base: {
    backgroundColor: appColors.surfaceContainerLowest,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
});
