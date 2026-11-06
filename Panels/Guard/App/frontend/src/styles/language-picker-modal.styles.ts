import { StyleSheet } from 'react-native';

import { appColors, appRadii, appSpacing, appTypography } from '../theme';

export const languagePickerModalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    maxHeight: '78%',
    backgroundColor: appColors.surfaceContainerLowest,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: appSpacing.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: appColors.outlineVariant,
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: appSpacing.md,
    paddingVertical: appSpacing.sm,
  },
  title: {
    ...appTypography.titleLg,
    color: appColors.onSurface,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.surfaceContainerHigh,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: appSpacing.md,
    marginBottom: appSpacing.sm,
    paddingHorizontal: appSpacing.sm,
    paddingVertical: 10,
    borderRadius: appRadii.xl,
    backgroundColor: appColors.surfaceContainerLow,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'PublicSans_400Regular',
    color: appColors.onSurface,
    padding: 0,
  },
  listContent: {
    paddingHorizontal: appSpacing.md,
    paddingBottom: appSpacing.xl,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: appSpacing.sm,
    borderRadius: appRadii.xl,
    backgroundColor: appColors.surfaceContainerLow,
  },
  rowSelected: {
    backgroundColor: appColors.primaryContainer + '22',
    borderWidth: 1,
    borderColor: appColors.primaryContainer,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  nativeName: {
    ...appTypography.labelLg,
    fontFamily: 'PublicSans_700Bold',
    color: appColors.onSurface,
  },
  nativeNameSelected: {
    color: appColors.primary,
  },
  englishName: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'PublicSans_400Regular',
    color: appColors.secondary,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: appSpacing.lg,
    color: appColors.secondary,
    fontFamily: 'PublicSans_400Regular',
  },
  pressed: {
    opacity: 0.88,
  },
});
