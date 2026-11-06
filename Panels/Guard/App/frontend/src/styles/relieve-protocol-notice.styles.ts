import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const relieveProtocolNoticeStyles = StyleSheet.create({
  card: {
    backgroundColor: appColors.surfaceContainer,
    borderRadius: appRadii.xl,
    padding: appSpacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...appTypography.labelXl,
    color: appColors.onSurface,
    marginBottom: 4,
  },
  message: {
    ...appTypography.bodyLg,
    color: appColors.onSurface,
    lineHeight: 22,
  },
  guardHighlight: {
    fontFamily: 'PublicSans_700Bold',
    color: appColors.primary,
  },
  keysRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  keysText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'PublicSans_600SemiBold',
    color: appColors.onSurfaceVariant,
    flex: 1,
  },
});
