import { Image, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import { firstNameFromFullName } from '../../utils/shift-display';

type GuardUserAvatarProps = {
  /** Override photo URL; defaults to signed-in guard profile picture. */
  photoUri?: string | null;
  /** Override full name used for the first-name fallback. */
  fullName?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Circular avatar: profile photo when available, otherwise the guard's first name.
 */
export function GuardUserAvatar({
  photoUri,
  fullName,
  size = 36,
  style,
}: GuardUserAvatarProps) {
  const { guardUser } = useGuardAppNavigation();
  const resolvedUri = (photoUri ?? guardUser?.profilePictureUrl ?? '').trim();
  const resolvedName = (fullName ?? guardUser?.fullName ?? 'Guard').trim() || 'Guard';
  const firstName = firstNameFromFullName(resolvedName);
  const radius = size / 2;
  const fontSize = Math.max(9, Math.round(size * 0.28));

  if (resolvedUri) {
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: radius,
            overflow: 'hidden',
            backgroundColor: appColors.surfaceContainer,
          },
          style,
        ]}
      >
        <Image
          source={{ uri: resolvedUri }}
          style={{ width: size, height: size, borderRadius: radius }}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: appColors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 2,
        },
        style,
      ]}
    >
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.55}
        style={{
          color: appColors.onPrimary,
          fontSize,
          lineHeight: fontSize + 2,
          fontFamily: 'PublicSans_700Bold',
          textAlign: 'center',
        }}
      >
        {firstName}
      </Text>
    </View>
  );
}
