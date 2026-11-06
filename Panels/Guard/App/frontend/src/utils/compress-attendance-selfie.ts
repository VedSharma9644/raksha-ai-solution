import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const MAX_EDGE_PX = 720;
const JPEG_QUALITY = 0.55;

export type CompressedSelfie = {
  /** file:// or content URI suitable for fetch/blob upload */
  uri: string;
  /** base64 without data-URL prefix (legacy JSON fallback) */
  base64: string;
};

/**
 * Resize + JPEG-compress a camera capture before punch-in/out upload.
 * Keeps latency low and avoids multi-MB base64 JSON bodies.
 */
export async function compressAttendanceSelfie(
  photoUri: string,
): Promise<CompressedSelfie> {
  const result = await manipulateAsync(
    photoUri,
    [{ resize: { width: MAX_EDGE_PX } }],
    {
      compress: JPEG_QUALITY,
      format: SaveFormat.JPEG,
      base64: true,
    },
  );

  if (!result.base64) {
    throw new Error('Could not compress selfie. Please try again.');
  }

  return {
    uri: result.uri,
    base64: result.base64,
  };
}
