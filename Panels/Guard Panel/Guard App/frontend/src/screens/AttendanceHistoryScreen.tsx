import { ScreenShell } from '../components/layout/ScreenShell';
import { AttendanceHistoryScreenContent } from '../components/attendance-history/AttendanceHistoryScreenContent';
import { brandAssets } from '../constants/brand-assets';
import { attendanceHistoryDefaults } from '../constants/attendance-history-defaults';

export function AttendanceHistoryScreen() {
  return (
    <ScreenShell
      screenTitle={attendanceHistoryDefaults.screenTitle}
      activeTab="attendance"
      profilePhotoUri={brandAssets.scheduleHeaderAvatarUri}
    >
      <AttendanceHistoryScreenContent />
    </ScreenShell>
  );
}
