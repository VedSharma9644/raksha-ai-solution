import type { MaterialIcons } from '@expo/vector-icons';

export type DutyQuickActionItem = {
  key: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

export const dutyQuickActionItems: DutyQuickActionItem[] = [
  {
    key: 'schedule',
    title: 'Schedule',
    subtitle: 'Upcoming shifts',
    icon: 'calendar-month',
  },
  {
    key: 'leave',
    title: 'Leave',
    subtitle: 'Apply or check',
    icon: 'event-busy',
  },
  {
    key: 'history',
    title: 'History',
    subtitle: 'Attendance log',
    icon: 'fact-check',
  },
  {
    key: 'relieve',
    title: 'Relief',
    subtitle: 'Request cover',
    icon: 'published-with-changes',
  },
];
