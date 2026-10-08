import { StackScrollScreenShell } from '../components/layout/StackScrollScreenShell';
import { ShiftDetailsScreenContent } from '../components/shift-details/ShiftDetailsScreenContent';
import { shiftDetailsDefaults } from '../constants/shift-details-defaults';
import { useGuardAppNavigation } from '../navigation/useGuardAppNavigation';

export function ShiftDetailsScreen() {
  const { goBack } = useGuardAppNavigation();

  return (
    <StackScrollScreenShell
      screenTitle={shiftDetailsDefaults.screenTitle}
      onBackPress={goBack}
    >
      <ShiftDetailsScreenContent />
    </StackScrollScreenShell>
  );
}
