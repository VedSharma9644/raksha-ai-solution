import { isCompact, ms } from './responsive';

export const appSpacing = {
  xs: ms(6),
  sm: ms(12),
  md: ms(16),
  lg: ms(24),
  xl: ms(36),
  gutter: isCompact ? ms(14) : ms(16),
  margin: isCompact ? ms(14) : ms(16),
} as const;

export const appRadii = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const appLayout = {
  headerHeight: isCompact ? 56 : 64,
  /** Tab row only — safe-area inset is applied separately by BottomTabMenu. */
  bottomNavHeight: isCompact ? 64 : 72,
} as const;
