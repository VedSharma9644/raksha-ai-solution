import { Dimensions, PixelRatio } from 'react-native';

/** Design reference — common modern Android width. */
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

export const screenWidth = WINDOW_WIDTH;
export const screenHeight = WINDOW_HEIGHT;

/** Short phones (e.g. 360×640 class) and narrow widths. */
export const isCompactWidth = WINDOW_WIDTH < 360;
export const isCompactHeight = WINDOW_HEIGHT < 700;
export const isCompact = isCompactWidth || isCompactHeight;

/** Large phones / small tablets. */
export const isWide = WINDOW_WIDTH >= 420;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Horizontal scale from design width. */
export function scale(size: number): number {
  return (WINDOW_WIDTH / BASE_WIDTH) * size;
}

/** Vertical scale from design height. */
export function verticalScale(size: number): number {
  return (WINDOW_HEIGHT / BASE_HEIGHT) * size;
}

/**
 * Moderated scale — preferred for spacing/type so small phones
 * don't crush UI and large phones don't balloon it.
 */
export function moderateScale(size: number, factor = 0.45): number {
  const scaled = scale(size);
  return size + (scaled - size) * factor;
}

/** Pixel-snapped size for crisp layouts. */
export function ms(size: number, factor = 0.45): number {
  return Math.round(PixelRatio.roundToNearestPixel(moderateScale(size, factor)));
}

/** Slightly stronger moderation for font sizes. */
export function fontScale(size: number): number {
  const scaled = moderateScale(size, isCompactWidth ? 0.35 : 0.4);
  return Math.round(PixelRatio.roundToNearestPixel(clamp(scaled, size * 0.88, size * 1.12)));
}

/**
 * Exact two-column tile width for a row that uses `gap`.
 * Avoids the classic 48%+gap overflow on narrow Android screens.
 */
export function twoColumnTileWidth(options?: {
  horizontalGutter?: number;
  gap?: number;
}): number {
  const gutter = options?.horizontalGutter ?? ms(16);
  const gap = options?.gap ?? ms(12);
  return Math.floor((WINDOW_WIDTH - gutter * 2 - gap) / 2);
}

/** Content max width on very wide devices (keeps cards readable). */
export const contentMaxWidth = Math.min(WINDOW_WIDTH, 480);
