import { Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { brandAssets } from '../../constants/brand-assets';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { layoutTopHeaderBarStyles as styles } from '../../styles/layout-top-header-bar.styles';
import { GuardUserAvatar } from '../shared/GuardUserAvatar';
import { NotificationBellButton } from './NotificationBellButton';

type TopAppHeaderProps = {
  screenTitle?: string;
  /** Optional override; defaults to signed-in guard profile picture. */
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
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.brand} numberOfLines={1}>
              Raksha
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {screenTitle}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <NotificationBellButton
            style={styles.iconButton}
            pressedStyle={styles.iconButtonPressed}
            badgeStyle={styles.notificationBadge}
            badgeTextStyle={styles.notificationBadgeText}
            dotStyle={styles.notificationDot}
          />

          <Pressable
            accessibilityLabel="Open guard profile"
            onPress={openGuardProfile}
            style={styles.avatarWrap}
          >
            <GuardUserAvatar
              photoUri={profilePhotoUri}
              size={36}
              style={styles.avatarPhoto}
            />
            <View style={styles.onlineDot} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
