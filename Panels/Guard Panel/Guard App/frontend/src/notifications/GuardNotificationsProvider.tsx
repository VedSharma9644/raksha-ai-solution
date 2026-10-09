import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import {
  fetchGuardNotifications,
  markGuardNotificationsRead,
  registerPushToken,
  unregisterPushToken,
  type GuardNotificationDto,
} from '../api/guard-api';
import { useGuardAppNavigation } from '../navigation/useGuardAppNavigation';
import { requestRosterSync } from '../sync/rosterSync';
import {
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  getLastNotificationResponseAsync,
} from './localNotifications';
import { preparePushRegistration } from './pushRegistration';
import { cancelShiftReminders, rescheduleShiftReminders } from './shiftReminders';

type GuardNotificationsContextValue = {
  notifications: GuardNotificationDto[];
  unreadCount: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
};

const GuardNotificationsContext = createContext<GuardNotificationsContextValue | null>(
  null,
);

export function GuardNotificationsProvider({ children }: { children: ReactNode }) {
  const {
    authToken,
    guardUser,
    shiftActive,
    openLeaveTimeOff,
    openShiftDetails,
    goHome,
    isAuthenticated,
  } = useGuardAppNavigation();

  const [notifications, setNotifications] = useState<GuardNotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const pushMetaRef = useRef<{ expoPushToken: string; deviceId: string } | null>(null);
  const lastAuthTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (authToken) {
      lastAuthTokenRef.current = authToken;
    }
  }, [authToken]);
  const navigateFromData = useCallback(
    (data: Record<string, unknown> | undefined) => {
      const screen = typeof data?.screen === 'string' ? data.screen : '';
      const type = typeof data?.type === 'string' ? data.type : '';
      if (screen === 'leaveTimeOff' || type === 'leave_decision') {
        openLeaveTimeOff();
        return;
      }
      if (
        screen === 'shiftDetails' ||
        type === 'shift_start_reminder' ||
        type === 'login_reminder' ||
        type === 'shift_end_reminder' ||
        type === 'sign_out_reminder'
      ) {
        openShiftDetails();
        return;
      }
      if (type === 'roster_update' || data?.refresh === 'roster') {
        requestRosterSync('push:roster_update');
        goHome();
        return;
      }
      if (screen === 'home') {
        goHome();
      }
    },
    [goHome, openLeaveTimeOff, openShiftDetails],
  );

  const refresh = useCallback(async () => {
    if (!authToken || !isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    setIsLoading(true);
    try {
      const data = await fetchGuardNotifications(authToken);
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // Keep last known inbox on transient errors
    } finally {
      setIsLoading(false);
    }
  }, [authToken, isAuthenticated]);

  const markAllRead = useCallback(async () => {
    if (!authToken) {
      return;
    }
    await markGuardNotificationsRead(authToken, { all: true });
    setNotifications((current) => current.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [authToken]);

  const markRead = useCallback(
    async (id: string) => {
      if (!authToken) {
        return;
      }
      let shouldDecrement = false;
      setNotifications((current) => {
        const target = current.find((n) => n.id === id);
        if (!target || target.read) {
          return current;
        }
        shouldDecrement = true;
        return current.map((n) => (n.id === id ? { ...n, read: true } : n));
      });
      if (shouldDecrement) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
      await markGuardNotificationsRead(authToken, { notificationIds: [id] });
    },
    [authToken],
  );

  // Register push + schedule local reminders when session is ready
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!authToken || !guardUser || !isAuthenticated) {
        await cancelShiftReminders().catch(() => undefined);
        return;
      }

      try {
        await rescheduleShiftReminders({
          shiftFrom: guardUser.shiftFrom,
          shiftTo: guardUser.shiftTo,
          siteName: guardUser.siteName,
          shiftActive,
        });
      } catch {
        // Local scheduling can fail on unsupported runtimes — keep app usable
      }

      // Skip getExpoPushTokenAsync in Expo Go Android (SDK 53+ removed remote push there)
      const prepared = await preparePushRegistration();
      if (cancelled || !prepared.expoPushToken || !prepared.deviceId) {
        return;
      }

      pushMetaRef.current = {
        expoPushToken: prepared.expoPushToken,
        deviceId: prepared.deviceId,
      };

      try {
        await registerPushToken(authToken, {
          expoPushToken: prepared.expoPushToken,
          deviceId: prepared.deviceId,
          platform: prepared.platform,
        });
      } catch {
        // Inbox + local reminders still work if remote registration fails
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [authToken, guardUser, isAuthenticated, shiftActive]);

  // Unregister on logout (token may already be cleared — use lastAuthTokenRef)
  useEffect(() => {
    if (isAuthenticated) {
      return;
    }
    const meta = pushMetaRef.current;
    const token = lastAuthTokenRef.current;
    pushMetaRef.current = null;
    lastAuthTokenRef.current = null;
    void cancelShiftReminders();
    setNotifications([]);
    setUnreadCount(0);
    if (meta && token) {
      void unregisterPushToken(token, meta).catch(() => undefined);
    }
  }, [isAuthenticated]);

  // Inbox polling + focus refresh for near-realtime updates
  useEffect(() => {
    if (!isAuthenticated || !authToken) {
      return;
    }

    void refresh();
    const interval = setInterval(() => {
      void refresh();
    }, 25_000);

    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        void refresh();
        if (guardUser) {
          void rescheduleShiftReminders({
            shiftFrom: guardUser.shiftFrom,
            shiftTo: guardUser.shiftTo,
            siteName: guardUser.siteName,
            shiftActive,
          });
        }
      }
    };
    const sub = AppState.addEventListener('change', onAppState);

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [authToken, guardUser, isAuthenticated, refresh, shiftActive]);

  // Foreground + tap handlers (local emitter APIs — safe in Expo Go)
  useEffect(() => {
    const received = addNotificationReceivedListener((event) => {
      const data = event.notification.request.content.data as
        | Record<string, unknown>
        | undefined;
      const type = typeof data?.type === 'string' ? data.type : '';
      if (type === 'roster_update' || data?.refresh === 'roster') {
        requestRosterSync('push:roster_update');
      }
      void refresh();
    });
    const response = addNotificationResponseReceivedListener((event) => {
      const data = event.notification.request.content.data as
        | Record<string, unknown>
        | undefined;
      navigateFromData(data);
      void refresh();
    });

    void getLastNotificationResponseAsync().then((last) => {
      if (!last) {
        return;
      }
      navigateFromData(
        last.notification.request.content.data as Record<string, unknown> | undefined,
      );
    });

    return () => {
      received.remove();
      response.remove();
    };
  }, [navigateFromData, refresh]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      refresh,
      markAllRead,
      markRead,
    }),
    [notifications, unreadCount, isLoading, refresh, markAllRead, markRead],
  );

  return (
    <GuardNotificationsContext.Provider value={value}>
      {children}
    </GuardNotificationsContext.Provider>
  );
}

export function useGuardNotifications(): GuardNotificationsContextValue {
  const ctx = useContext(GuardNotificationsContext);
  if (!ctx) {
    throw new Error('useGuardNotifications must be used within GuardNotificationsProvider');
  }
  return ctx;
}
