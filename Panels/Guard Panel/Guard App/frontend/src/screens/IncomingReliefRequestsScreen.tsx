import { IncomingReliefRequestsScreenContent } from '../components/incoming-relief/IncomingReliefRequestsScreenContent';
import { StackScrollScreenShell } from '../components/layout/StackScrollScreenShell';
import { incomingReliefRequestsDefaults } from '../constants/incoming-relief-requests-defaults';
import { useGuardAppNavigation } from '../navigation/useGuardAppNavigation';

export function IncomingReliefRequestsScreen() {
  const { goBack } = useGuardAppNavigation();

  return (
    <StackScrollScreenShell
      brandEyebrow={incomingReliefRequestsDefaults.brandEyebrow}
      screenTitle={incomingReliefRequestsDefaults.screenTitle}
      onBackPress={goBack}
      showNotifications
    >
      <IncomingReliefRequestsScreenContent />
    </StackScrollScreenShell>
  );
}
