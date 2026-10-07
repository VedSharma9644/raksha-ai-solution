import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const relieveGuidanceBannerStyles = StyleSheet.create({
  card: {
    backgroundColor: appColors.surfaceContainerHigh,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: appSpacing.sm,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: appColors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...appTypography.headlineSm,
    color: appColors.onSurface,
    marginBottom: 4,
  },
  message: {
    ...appTypography.bodyLg,
    color: appColors.onSurfaceVariant,
    lineHeight: 22,
  },
  policyChip: {
    marginTop: appSpacing.sm,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: appRadii.full,
    backgroundColor: appColors.surfaceContainerHighest,
  },
  policyText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onSurface,
  },
  guardStrip: {
    marginTop: appSpacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(239, 244, 255, 0.7)',
    borderRadius: appRadii.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  guardStripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  guardStripText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'PublicSans_600SemiBold',
    color: appColors.onSurfaceVariant,
    flexShrink: 1,
  },
  guardId: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onSurface,
  },
});
