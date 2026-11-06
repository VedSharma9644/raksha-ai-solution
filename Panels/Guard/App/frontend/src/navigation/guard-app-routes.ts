import type { BottomTabKey } from '../constants/bottom-tab-menu-items';

export type GuardMainTab = BottomTabKey;

export type GuardStackRoute =
  | 'patrolSession'
  | 'attendanceMarked'
  | 'shiftDetails'
  | 'applyForLeave'
  | 'leaveTimeOff'
  | 'relieveAGuard'
  | 'incomingReliefRequests'
  | 'guardProfile'
  | 'notifications';
