import { ScheduleControlRoomHotline } from './ScheduleControlRoomHotline';
import { ScheduleGuardSummaryBanner } from './ScheduleGuardSummaryBanner';
import { ScheduleShiftReliefRequestCard } from './ScheduleShiftReliefRequestCard';
import { ScheduleTodayShiftHeroCard } from './ScheduleTodayShiftHeroCard';
import { ScheduleUpcomingShiftsSection } from './ScheduleUpcomingShiftsSection';
import { ScheduleWeekFilterTabs } from './ScheduleWeekFilterTabs';

export function UpcomingScheduleScreenContent() {
  return (
    <>
      <ScheduleGuardSummaryBanner />
      <ScheduleWeekFilterTabs />
      <ScheduleTodayShiftHeroCard />
      <ScheduleUpcomingShiftsSection />
      <ScheduleShiftReliefRequestCard />
      <ScheduleControlRoomHotline />
    </>
  );
}
