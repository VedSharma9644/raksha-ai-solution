import { MaterialIcons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import type { GuardNotificationDto } from '../../api/guard-api';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { useGuardNotifications } from '../../notifications/GuardNotificationsProvider';
import { notificationsScreenStyles as styles } from '../../styles/notifications-screen.styles';
import { appColors } from '../../theme';

function iconForType(type: string): keyof typeof MaterialIcons.glyphMap {
  switch (type) {
    case 'leave_decision':
      return 'event-available';
    case 'shift_start_reminder':
      return 'alarm';
    case 'login_reminder':
      return 'login';
    case 'shift_end_reminder':
      return 'schedule';
    case 'sign_out_reminder':
      return 'logout';
    default:
      return 'notifications';
  }
}

function formatRelativeTime(iso: string): string {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) {
    return '';
  }
  const delta = Date.now() - ms;
  const minutes = Math.floor(delta / 60_000);
  if (minutes < 1) {
    return 'Just now';
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }
  return new Date(ms).toLocaleDateString();
}

function navigateFromNotification(
  item: GuardNotificationDto,
  nav: {
    openLeaveTimeOff: () => void;
    openShiftDetails: () => void;
    goHome: () => void;
  },
) {
  const screen = item.data?.screen ?? '';
  const type = item.type;
  if (screen === 'leaveTimeOff' || type === 'leave_decision') {
    nav.openLeaveTimeOff();
    return;
  }
  if (
    type === 'shift_start_reminder' ||
    type === 'login_reminder' ||
    type === 'shift_end_reminder' ||
    type === 'sign_out_reminder'
  ) {
    nav.openShiftDetails();
    return;
  }
  if (screen === 'home') {
    nav.goHome();
  }
}

export function NotificationsScreenContent() {
  const { notifications, unreadCount, isLoading, markAllRead, markRead } =
    useGuardNotifications();
  const { openLeaveTimeOff, openShiftDetails, goHome } = useGuardAppNavigation();

  const onPressItem = useCallback(
    async (item: GuardNotificationDto) => {
      if (!item.read) {
        try {
          await markRead(item.id);
        } catch {
          // Still navigate even if mark-read fails
        }
      }
      navigateFromNotification(item, { openLeaveTimeOff, openShiftDetails, goHome });
    },
    [goHome, markRead, openLeaveTimeOff, openShiftDetails],
  );

  return (
    <View style={styles.root}>
      <View style={styles.toolbar}>
        <Text style={styles.toolbarLabel}>
          {unreadCount > 0
            ? `${unreadCount} unread`
            : notifications.length > 0
              ? 'All caught up'
              : 'No notifications yet'}
        </Text>
        <Pressable
          accessibilityLabel="Mark all notifications as read"
          disabled={unreadCount === 0}
          onPress={() => {
            void markAllRead().catch(() => undefined);
          }}
          style={({ pressed }) => [
            styles.markAllButton,
            pressed && unreadCount > 0 && styles.markAllButtonPressed,
          ]}
        >
          <Text
            style={[
              styles.markAllText,
              unreadCount === 0 && styles.markAllTextDisabled,
            ]}
          >
            Mark all read
          </Text>
        </Pressable>
      </View>

      {isLoading && notifications.length === 0 ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={appColors.primary} />
        </View>
      ) : null}

      {!isLoading && notifications.length === 0 ? (
        <View style={styles.emptyWrap}>
          <MaterialIcons name="notifications-none" size={48} color={appColors.secondary} />
          <Text style={styles.emptyTitle}>You're all set</Text>
          <Text style={styles.emptyBody}>
            Leave updates, shift reminders, and punch alerts will show up here.
          </Text>
        </View>
      ) : null}

      <View style={styles.list}>
        {notifications.map((item) => (
          <Pressable
            key={item.id}
            accessibilityLabel={item.title}
            onPress={() => {
              void onPressItem(item);
            }}
            style={({ pressed }) => [
              styles.card,
              !item.read && styles.cardUnread,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconWrap}>
                <MaterialIcons
                  name={iconForType(item.type)}
                  size={20}
                  color={appColors.primary}
                />
              </View>
              <View style={styles.titleBlock}>
                <View style={styles.titleRow}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {!item.read ? <View style={styles.unreadDot} /> : null}
                </View>
                <Text style={styles.time}>{formatRelativeTime(item.createdAt)}</Text>
              </View>
            </View>
            <Text style={styles.body}>{item.body}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
