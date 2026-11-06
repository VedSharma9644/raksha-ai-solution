import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const incomingSwapProposalCardStyles = StyleSheet.create({
  card: {
    backgroundColor: appColors.surfaceContainerLowest,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardDismissed: {
    opacity: 0.4,
  },
  spine: {
    position: 'absolute',
    left: 0,
    top: 12,
    bottom: 12,
    width: 6,
    borderTopRightRadius: appRadii.full,
    borderBottomRightRadius: appRadii.full,
    backgroundColor: appColors.primaryContainer,
  },
  body: {
    paddingLeft: 8,
    gap: appSpacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: appRadii.full,
    backgroundColor: appColors.primaryFixed,
  },
  tagText: {
    ...appTypography.labelLg,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onPrimaryFixed,
  },
  statusText: {
    ...appTypography.labelLg,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.secondary,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: appSpacing.sm,
    paddingTop: 4,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.sm,
    flex: 1,
    minWidth: 0,
  },
  photo: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  profileCopy: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
  },
  meta: {
    ...appTypography.bodyLg,
    color: appColors.onSurfaceVariant,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: appColors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exchangeList: {
    gap: 8,
    paddingTop: 4,
  },
  exchangeBox: {
    borderRadius: appRadii.lg,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  wantsBox: {
    backgroundColor: appColors.surfaceContainerLow,
  },
  givesBox: {
    backgroundColor: appColors.surfaceContainerHigh,
  },
  exchangeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wantsIcon: {
    backgroundColor: appColors.tertiaryFixed,
  },
  givesIcon: {
    backgroundColor: appColors.primaryFixed,
  },
  exchangeCopy: {
    flex: 1,
    minWidth: 0,
  },
  exchangeLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  givesLabel: {
    color: appColors.primary,
  },
  exchangeShift: {
    ...appTypography.titleLg,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onSurface,
  },
  exchangePost: {
    ...appTypography.bodyLg,
    color: appColors.onSurfaceVariant,
  },
  noteBox: {
    backgroundColor: appColors.surfaceContainer,
    borderRadius: appRadii.lg,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  noteText: {
    ...appTypography.bodyLg,
    color: appColors.onSurface,
    flex: 1,
  },
  noteBold: {
    fontFamily: 'PublicSans_700Bold',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 4,
  },
  acceptButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: appRadii.xl,
    backgroundColor: appColors.primaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  acceptLabel: {
    ...appTypography.labelXl,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onPrimary,
  },
  rejectButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: appRadii.xl,
    backgroundColor: appColors.surfaceContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  rejectLabel: {
    ...appTypography.labelXl,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onSurface,
  },
  pressed: {
    opacity: 0.9,
  },
});
