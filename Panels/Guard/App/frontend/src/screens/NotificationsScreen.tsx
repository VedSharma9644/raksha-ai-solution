import { NotificationsScreenContent } from '../components/notifications/NotificationsScreenContent';
import { StackScrollScreenShell } from '../components/layout/StackScrollScreenShell';
import { useGuardAppNavigation } from '../navigation/useGuardAppNavigation';
import { useGuardNotifications } from '../notifications/GuardNotificationsProvider';

export function NotificationsScreen() {
  const { goBack } = useGuardAppNavigation();
  const { isLoading, refresh } = useGuardNotifications();

  return (
    <StackScrollScreenShell
      screenTitle="Notifications"
      onBackPress={goBack}
      refreshing={isLoading}
      onRefresh={() => {
        void refresh();
      }}
    >
      <NotificationsScreenContent />
    </StackScrollScreenShell>
  );
}
