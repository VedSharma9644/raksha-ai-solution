import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const appAlertStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 28, 48, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: appSpacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: appColors.surfaceContainerLowest,
    borderRadius: 20,
    padding: appSpacing.lg,
    gap: appSpacing.md,
    borderWidth: 1,
    borderColor: appColors.outlineVariant,
    shadowColor: '#0b1c30',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInfo: {
    backgroundColor: appColors.primaryFixed,
  },
  iconWarning: {
    backgroundColor: appColors.errorContainer,
  },
  iconSuccess: {
    backgroundColor: '#d1fae5',
  },
  iconEmergency: {
    backgroundColor: appColors.tertiaryFixed,
  },
  title: {
    ...appTypography.headlineSm,
    color: appColors.onSurface,
  },
  message: {
    ...appTypography.bodyLg,
    color: appColors.secondary,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: appSpacing.sm,
    paddingTop: 4,
  },
  actionsStacked: {
    flexDirection: 'column',
  },
  button: {
    flexGrow: 1,
    flexBasis: 120,
    minHeight: 50,
    borderRadius: appRadii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: appSpacing.md,
  },
  buttonStacked: {
    flexBasis: 'auto',
    width: '100%',
  },
  buttonDefault: {
    backgroundColor: appColors.primary,
  },
  buttonCancel: {
    backgroundColor: appColors.surfaceContainer,
  },
  buttonDestructive: {
    backgroundColor: appColors.error,
  },
  labelDefault: {
    ...appTypography.labelLg,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onPrimary,
    textAlign: 'center',
  },
  labelCancel: {
    ...appTypography.labelLg,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onSurface,
    textAlign: 'center',
  },
  labelDestructive: {
    ...appTypography.labelLg,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onError,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
});
