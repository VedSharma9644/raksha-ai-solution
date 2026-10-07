import { MaterialIcons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { brandAssets } from '../../constants/brand-assets';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import { layoutTopHeaderBarStyles as styles } from '../../styles/layout-top-header-bar.styles';

type TopAppHeaderProps = {
  screenTitle?: string;
  profilePhotoUri?: string;
};

export function TopAppHeader({ screenTitle = 'Home', profilePhotoUri }: TopAppHeaderProps) {
  const insets = useSafeAreaInsets();
  const { openGuardProfile } = useGuardAppNavigation();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <View style={styles.brandRow}>
          <Image
            source={{ uri: brandAssets.rakshaLogoUri }}
            style={styles.logo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.brand}>Raksha</Text>
            <Text style={styles.subtitle}>{screenTitle}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityLabel="Notifications"
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
          >
            <MaterialIcons name="notifications-none" size={24} color={appColors.onSurfaceVariant} />
            <View style={styles.notificationDot} />
          </Pressable>

          <Pressable
            accessibilityLabel="Open guard profile"
            onPress={openGuardProfile}
            style={styles.avatarWrap}
          >
            {profilePhotoUri ? (
              <Image source={{ uri: profilePhotoUri }} style={styles.avatarPhoto} />
            ) : (
              <View style={styles.avatar}>
                <MaterialIcons name="person" size={18} color={appColors.onPrimary} />
              </View>
            )}
            <View style={styles.onlineDot} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
