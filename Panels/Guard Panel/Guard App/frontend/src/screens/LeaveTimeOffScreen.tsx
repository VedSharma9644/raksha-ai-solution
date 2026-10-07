import { LeaveTimeOffScreenContent } from '../components/leave/LeaveTimeOffScreenContent';
import { StackScrollScreenShell } from '../components/layout/StackScrollScreenShell';
import { leaveTimeOffDefaults } from '../constants/leave-time-off-defaults';
import { useGuardAppNavigation } from '../navigation/useGuardAppNavigation';

export function LeaveTimeOffScreen() {
  const { goBack } = useGuardAppNavigation();

  return (
    <StackScrollScreenShell
      screenTitle={leaveTimeOffDefaults.screenTitle}
      onBackPress={goBack}
      showNotifications
    >
      <LeaveTimeOffScreenContent />
    </StackScrollScreenShell>
  );
}
