import { MaterialIcons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { brandAssets } from '../../constants/brand-assets';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { appColors } from '../../theme';
import { layoutBackNavigationHeaderStyles as styles } from '../../styles/layout-back-navigation-header.styles';
import { GuardUserAvatar } from '../shared/GuardUserAvatar';
import { NotificationBellButton } from './NotificationBellButton';

type BackNavigationHeaderProps = {
  screenTitle: string;
  onBackPress: () => void;
  brandEyebrow?: string;
  /** Optional override; defaults to signed-in guard profile picture. */
  profilePhotoUri?: string;
  showNotifications?: boolean;
  enableProfilePress?: boolean;
};

export function BackNavigationHeader({
  screenTitle,
  onBackPress,
  brandEyebrow,
  profilePhotoUri,
  showNotifications = false,
  enableProfilePress = true,
}: BackNavigationHeaderProps) {
  const insets = useSafeAreaInsets();
  const { openGuardProfile, stackRoute } = useGuardAppNavigation();
  const canOpenProfile = enableProfilePress && stackRoute !== 'guardProfile';

  const profileNode = (
    <GuardUserAvatar photoUri={profilePhotoUri} size={36} style={styles.profilePhoto} />
  );

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <View style={styles.leftCluster}>
          <Pressable
            accessibilityLabel="Go back"
            onPress={onBackPress}
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          >
            <MaterialIcons name="arrow-back" size={24} color={appColors.onSurface} />
          </Pressable>
          <Image source={{ uri: brandAssets.rakshaLogoUri }} style={styles.logo} resizeMode="contain" />
          <View style={styles.titleBlock}>
            {brandEyebrow ? (
              <Text style={styles.brandEyebrow} numberOfLines={1}>
                {brandEyebrow}
              </Text>
            ) : null}
            <Text style={styles.title} numberOfLines={1}>
              {screenTitle}
            </Text>
          </View>
        </View>

        <View style={styles.rightActions}>
          {showNotifications ? (
            <NotificationBellButton
              style={styles.notificationButton}
              badgeStyle={styles.notificationBadge}
              badgeTextStyle={styles.notificationBadgeText}
              dotStyle={styles.notificationDot}
            />
          ) : null}

          {canOpenProfile ? (
            <Pressable accessibilityLabel="Open guard profile" onPress={openGuardProfile}>
              {profileNode}
            </Pressable>
          ) : (
            profileNode
          )}
        </View>
      </View>
    </View>
  );
}
