import { MaterialIcons } from '@expo/vector-icons';
import {
  Pressable,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { useGuardNotifications } from '../../notifications/GuardNotificationsProvider';
import { appColors } from '../../theme';

type NotificationBellButtonProps = {
  style?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
  dotStyle?: StyleProp<ViewStyle>;
  badgeStyle?: StyleProp<ViewStyle>;
  badgeTextStyle?: StyleProp<TextStyle>;
};

export function NotificationBellButton({
  style,
  pressedStyle,
  dotStyle,
  badgeStyle,
  badgeTextStyle,
}: NotificationBellButtonProps) {
  const { openNotifications, stackRoute } = useGuardAppNavigation();
  const { unreadCount } = useGuardNotifications();
  const isActive = stackRoute === 'notifications';

  return (
    <Pressable
      accessibilityLabel={
        unreadCount > 0
          ? `Notifications, ${unreadCount} unread`
          : 'Notifications'
      }
      disabled={isActive}
      onPress={openNotifications}
      style={({ pressed }) => [style, pressed && pressedStyle]}
    >
      <MaterialIcons
        name={unreadCount > 0 ? 'notifications' : 'notifications-none'}
        size={24}
        color={appColors.onSurfaceVariant}
      />
      {unreadCount > 0 ? (
        badgeStyle ? (
          <View style={badgeStyle}>
            <Text style={badgeTextStyle}>
              {unreadCount > 99 ? '99+' : String(unreadCount)}
            </Text>
          </View>
        ) : (
          <View style={dotStyle} />
        )
      ) : null}
    </Pressable>
  );
}
