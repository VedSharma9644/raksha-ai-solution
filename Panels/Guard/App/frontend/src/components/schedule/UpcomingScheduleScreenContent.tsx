import { useState } from 'react';

import type { WeekSegmentKey } from '../shared/WeekSegmentTabs';
import { ScheduleControlRoomHotline } from './ScheduleControlRoomHotline';
import { ScheduleGuardSummaryBanner } from './ScheduleGuardSummaryBanner';
import { ScheduleShiftReliefRequestCard } from './ScheduleShiftReliefRequestCard';
import { ScheduleTodayShiftHeroCard } from './ScheduleTodayShiftHeroCard';
import { ScheduleUpcomingShiftsSection } from './ScheduleUpcomingShiftsSection';
import { ScheduleWeekFilterTabs } from './ScheduleWeekFilterTabs';

export function UpcomingScheduleScreenContent() {
  const [activeWeek, setActiveWeek] = useState<WeekSegmentKey>('thisWeek');

  return (
    <>
      <ScheduleGuardSummaryBanner />
      <ScheduleWeekFilterTabs activeWeek={activeWeek} onChange={setActiveWeek} />
      <ScheduleTodayShiftHeroCard />
      <ScheduleUpcomingShiftsSection
        weekFilter={activeWeek === 'nextWeek' ? 'nextWeek' : 'thisWeek'}
      />
      <ScheduleShiftReliefRequestCard />
      <ScheduleControlRoomHotline />
    </>
  );
}
