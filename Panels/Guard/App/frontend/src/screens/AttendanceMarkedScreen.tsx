import { StackScrollScreenShell } from '../components/layout/StackScrollScreenShell';
import { AttendanceMarkedScreenContent } from '../components/attendance-marked/AttendanceMarkedScreenContent';
import { attendanceMarkedDefaults } from '../constants/attendance-marked-defaults';
import { useGuardAppNavigation } from '../navigation/useGuardAppNavigation';

export function AttendanceMarkedScreen() {
  const { goHome } = useGuardAppNavigation();

  return (
    <StackScrollScreenShell
      screenTitle={attendanceMarkedDefaults.screenTitle}
      onBackPress={goHome}
    >
      <AttendanceMarkedScreenContent />
    </StackScrollScreenShell>
  );
}
