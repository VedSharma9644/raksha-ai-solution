import { ScreenShell } from '../components/layout/ScreenShell';
import { UpcomingScheduleScreenContent } from '../components/schedule/UpcomingScheduleScreenContent';
import { brandAssets } from '../constants/brand-assets';
import { upcomingScheduleDefaults } from '../constants/upcoming-schedule-defaults';

export function UpcomingScheduleScreen() {
  return (
    <ScreenShell
      screenTitle={upcomingScheduleDefaults.screenTitle}
      activeTab="schedule"
      profilePhotoUri={brandAssets.scheduleHeaderAvatarUri}
    >
      <UpcomingScheduleScreenContent />
    </ScreenShell>
  );
}
