import { useState } from 'react';

import type { WeekSegmentKey } from '../shared/WeekSegmentTabs';
import { WeekSegmentTabs } from '../shared/WeekSegmentTabs';

export function ScheduleWeekFilterTabs() {
  const [activeWeek, setActiveWeek] = useState<WeekSegmentKey>('thisWeek');

  return <WeekSegmentTabs activeKey={activeWeek} onChange={setActiveWeek} />;
}
