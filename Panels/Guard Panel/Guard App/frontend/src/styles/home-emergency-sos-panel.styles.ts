import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const homeEmergencySosPanelStyles = StyleSheet.create({
  card: {
    backgroundColor: appColors.errorContainer,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    gap: appSpacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: appSpacing.sm,
  },
  warningIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: appColors.tertiaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...appTypography.titleLg,
    color: appColors.onErrorContainer,
    fontFamily: 'PublicSans_700Bold',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  description: {
    ...appTypography.labelLg,
    color: appColors.onErrorContainer,
    marginTop: 2,
  },
});
