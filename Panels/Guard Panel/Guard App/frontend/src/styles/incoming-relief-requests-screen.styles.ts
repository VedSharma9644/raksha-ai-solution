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
  card: {
    backgroundColor: appColors.surfaceContainerLow,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: appSpacing.xs,
    flexWrap: 'wrap',
  },
  cardStatus: {
    ...appTypography.labelLg,
    color: appColors.primary,
    fontFamily: 'PublicSans_700Bold',
  },
  cardMeta: {
    ...appTypography.labelLg,
    color: appColors.secondary,
  },
  cardTitle: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
  },
  cardDetail: {
    ...appTypography.bodyLg,
    color: appColors.onSurfaceVariant,
  },
  withdrawButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: appRadii.lg,
    backgroundColor: appColors.surfaceContainerHighest,
  },
  withdrawLabel: {
    ...appTypography.labelLg,
    color: appColors.error,
    fontFamily: 'PublicSans_700Bold',
  },
  emptyText: {
    ...appTypography.bodyLg,
    color: appColors.onSurfaceVariant,
  },
  historyBlock: {
    gap: 6,
  },
  historyTitle: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
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
