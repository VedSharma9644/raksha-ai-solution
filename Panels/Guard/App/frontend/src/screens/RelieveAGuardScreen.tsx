import { StackScrollScreenShell } from '../components/layout/StackScrollScreenShell';
import { RelieveAGuardScreenContent } from '../components/relieve/RelieveAGuardScreenContent';
import { relieveAGuardDefaults } from '../constants/relieve-a-guard-defaults';
import { useGuardAppNavigation } from '../navigation/useGuardAppNavigation';

export function RelieveAGuardScreen() {
  const { goBack } = useGuardAppNavigation();

  return (
    <StackScrollScreenShell
      brandEyebrow={relieveAGuardDefaults.brandEyebrow}
      screenTitle={relieveAGuardDefaults.screenTitle}
      onBackPress={goBack}
      showNotifications
    >
      <RelieveAGuardScreenContent />
    </StackScrollScreenShell>
  );
}
