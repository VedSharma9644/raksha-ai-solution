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
    title: 'My Schedule',
    subtitle: 'Next: Tomorrow Day',
    icon: 'calendar-month',
  },
  {
    key: 'leave',
    title: 'Leave',
    subtitle: 'Apply or check status',
    icon: 'event-busy',
  },
  {
    key: 'history',
    title: 'History',
    subtitle: '24 days present',
    icon: 'fact-check',
  },
  {
    key: 'relieve',
    title: 'Relieve Guard',
    subtitle: 'Shift handover',
    icon: 'published-with-changes',
  },
];
