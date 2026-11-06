import type { WeekSegmentKey } from '../shared/WeekSegmentTabs';
import { WeekSegmentTabs } from '../shared/WeekSegmentTabs';

type ScheduleWeekFilterTabsProps = {
  activeWeek: WeekSegmentKey;
  onChange: (key: WeekSegmentKey) => void;
};

export function ScheduleWeekFilterTabs({
  activeWeek,
  onChange,
}: ScheduleWeekFilterTabsProps) {
  return <WeekSegmentTabs activeKey={activeWeek} onChange={onChange} />;
}
