import type { MaterialIcons } from '@expo/vector-icons';

export type BottomTabKey = 'home' | 'schedule' | 'attendance' | 'more';

export type BottomTabMenuItem = {
  key: BottomTabKey;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

export const bottomTabMenuItems: BottomTabMenuItem[] = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'schedule', label: 'Schedule', icon: 'calendar-today' },
  { key: 'attendance', label: 'Attendance', icon: 'fact-check' },
  { key: 'more', label: 'More', icon: 'grid-view' },
];
