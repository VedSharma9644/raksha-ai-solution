import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const leaveBalanceQuotaCardsStyles = StyleSheet.create({
  section: {
    gap: appSpacing.xs,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    gap: appSpacing.xs,
  },
  headingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  heading: {
    ...appTypography.labelLg,
    color: appColors.onSurface,
    flexShrink: 1,
  },
  rulesLink: {
    ...appTypography.labelLg,
    fontSize: 12,
    color: appColors.primary,
  },
  grid: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    flex: 1,
    backgroundColor: appColors.surfaceContainerLowest,
    borderRadius: appRadii.xl,
    padding: appSpacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
    justifyContent: 'space-between',
    minHeight: 100,
  },
  cardHighlighted: {
    borderBottomWidth: 2,
    borderBottomColor: appColors.primary,
  },
  cardTitle: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: 'PublicSans_600SemiBold',
    color: appColors.secondary,
  },
  valueRow: {
    marginVertical: 4,
  },
  value: {
    fontSize: 26,
    lineHeight: 30,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.primary,
  },
  valueAlt: {
    color: appColors.primaryContainer,
  },
  valueInstant: {
    ...appTypography.headlineSm,
    color: appColors.onSurface,
  },
  valueSuffix: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: 'PublicSans_500Medium',
    color: appColors.onSurfaceVariant,
  },
  subtitle: {
    fontSize: 10,
    lineHeight: 12,
    fontFamily: 'PublicSans_500Medium',
    color: appColors.onSurfaceVariant,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: appRadii.sm,
  },
  badgePaid: {
    backgroundColor: appColors.primaryFixed,
  },
  badgeSlip: {
    backgroundColor: appColors.surfaceContainerHigh,
  },
  badgeUrgent: {
    backgroundColor: appColors.errorContainer,
  },
  badgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: 'PublicSans_700Bold',
  },
  badgeTextPaid: {
    color: appColors.onPrimaryFixed,
  },
  badgeTextSlip: {
    color: appColors.onPrimaryFixedVariant,
  },
  badgeTextUrgent: {
    color: appColors.error,
  },
});
