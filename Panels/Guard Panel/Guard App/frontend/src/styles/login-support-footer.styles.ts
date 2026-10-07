import { StyleSheet } from 'react-native';

import { appColors, appRadii } from '../theme';

export const loginSupportFooterStyles = StyleSheet.create({
  footer: {
    marginTop: 24,
    marginBottom: 8,
    alignItems: 'center',
    gap: 12,
  },
  assistanceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  assistChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: appRadii.full,
    backgroundColor: appColors.surfaceContainer,
  },
  assistChipPressed: {
    backgroundColor: appColors.surfaceContainerHigh,
  },
  assistLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'PublicSans_600SemiBold',
    color: appColors.onSurface,
  },
  complianceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  complianceText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: 'PublicSans_500Medium',
    color: appColors.outline,
  },
});
