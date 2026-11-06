import { StackScrollScreenShell } from '../components/layout/StackScrollScreenShell';
import { ApplyForLeaveScreenContent } from '../components/leave/ApplyForLeaveScreenContent';
import { applyForLeaveDefaults } from '../constants/apply-for-leave-defaults';
import { useGuardAppNavigation } from '../navigation/useGuardAppNavigation';

export function ApplyForLeaveScreen() {
  const { goBack } = useGuardAppNavigation();

  return (
    <StackScrollScreenShell
      screenTitle={applyForLeaveDefaults.screenTitle}
      onBackPress={goBack}
      showNotifications
    >
      <ApplyForLeaveScreenContent />
    </StackScrollScreenShell>
  );
}
