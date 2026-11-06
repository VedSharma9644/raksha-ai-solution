import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const relieveReasonSectionStyles = StyleSheet.create({
  section: {
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: appColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    ...appTypography.labelLg,
    color: appColors.onPrimary,
    fontFamily: 'PublicSans_700Bold',
  },
  stepTitle: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
    flexShrink: 1,
  },
  hint: {
    ...appTypography.bodyLg,
    color: appColors.onSurfaceVariant,
    marginBottom: 4,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    width: '48%',
    flexGrow: 1,
    minHeight: 56,
    borderRadius: appRadii.xl,
    backgroundColor: appColors.surfaceContainerLowest,
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  chipSelected: {
    backgroundColor: appColors.primary,
  },
  chipPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.97 }],
  },
  chipLabel: {
    ...appTypography.labelLg,
    color: appColors.onSurface,
    textAlign: 'center',
    flexShrink: 1,
  },
  chipLabelSelected: {
    color: appColors.onPrimary,
  },
  voiceButton: {
    marginTop: appSpacing.sm,
    minHeight: 56,
    borderRadius: appRadii.xl,
    backgroundColor: appColors.surfaceContainerLow,
    paddingHorizontal: appSpacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: appSpacing.sm,
  },
  voiceButtonPressed: {
    backgroundColor: appColors.surfaceContainer,
  },
  voiceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  micCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: appColors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micCircleRecording: {
    backgroundColor: appColors.tertiary,
  },
  voiceCopy: {
    flex: 1,
    minWidth: 0,
  },
  voiceTitle: {
    ...appTypography.labelLg,
    color: appColors.onSurface,
  },
  voiceSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'PublicSans_400Regular',
    color: appColors.onSurfaceVariant,
  },
});
