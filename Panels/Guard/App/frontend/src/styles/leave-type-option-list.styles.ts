import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const leaveTypeOptionListStyles = StyleSheet.create({
  section: {
    gap: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: appColors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    fontSize: 12,
    lineHeight: 14,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onPrimary,
  },
  stepTitle: {
    ...appTypography.labelXl,
    color: appColors.onSurface,
  },
  list: {
    gap: 10,
  },
  option: {
    backgroundColor: appColors.surfaceContainerLowest,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: appSpacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: appColors.surfaceContainerLow,
    borderColor: appColors.primaryContainer,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.sm,
    flex: 1,
    minWidth: 0,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: appRadii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPaid: {
    backgroundColor: appColors.primaryFixed,
  },
  iconNeutral: {
    backgroundColor: appColors.surfaceContainerHigh,
  },
  iconUrgent: {
    backgroundColor: appColors.errorContainer,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  title: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
  },
  paidBadge: {
    backgroundColor: appColors.primaryFixedDim,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: appRadii.full,
  },
  paidBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onPrimaryFixed,
  },
  subtitle: {
    ...appTypography.bodyLg,
    fontSize: 14,
    lineHeight: 20,
    color: appColors.onSurfaceVariant,
    marginTop: 2,
  },
  radio: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: appColors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: appColors.primaryContainer,
  },
});
