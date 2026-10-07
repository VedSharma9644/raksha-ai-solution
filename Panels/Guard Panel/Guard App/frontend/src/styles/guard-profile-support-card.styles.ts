import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const guardProfileSupportCardStyles = StyleSheet.create({
  card: {
    backgroundColor: appColors.surfaceContainerLowest,
    borderRadius: 16,
    padding: appSpacing.md,
    gap: appSpacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  title: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
    marginBottom: 8,
  },
  helpline: {
    borderRadius: appRadii.xl,
    backgroundColor: appColors.primaryContainer,
    padding: appSpacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  helplineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.sm,
    flex: 1,
    minWidth: 0,
  },
  helplineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helplineTitle: {
    ...appTypography.labelLg,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onPrimary,
  },
  helplineSub: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'PublicSans_400Regular',
    color: appColors.primaryFixedDim,
  },
  rowTile: {
    backgroundColor: appColors.surfaceContainerLow,
    borderRadius: appRadii.xl,
    padding: appSpacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.sm,
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    ...appTypography.labelLg,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onSurface,
  },
  rowSub: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'PublicSans_400Regular',
    color: appColors.secondary,
  },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: appColors.surfaceContainerHigh,
    borderRadius: appRadii.full,
    padding: 2,
  },
  langButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: appRadii.full,
  },
  langButtonActive: {
    backgroundColor: appColors.primaryContainer,
  },
  langLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.secondary,
  },
  langLabelActive: {
    color: appColors.onPrimary,
  },
  logoutWrap: {
    paddingTop: appSpacing.sm,
  },
  logoutButton: {
    minHeight: 56,
    borderRadius: appRadii.xl,
    backgroundColor: appColors.surfaceContainerHigh,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: appSpacing.xs,
  },
  logoutLabel: {
    ...appTypography.labelXl,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.error,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'PublicSans_400Regular',
    color: appColors.secondary,
    marginTop: 8,
  },
  pressed: {
    opacity: 0.9,
  },
});
