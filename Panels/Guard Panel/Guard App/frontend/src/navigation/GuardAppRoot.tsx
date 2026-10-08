import { StatusBar } from 'expo-status-bar';
import { Fragment } from 'react';

import { ApplyForLeaveScreen } from '../screens/ApplyForLeaveScreen';
import { AttendanceHistoryScreen } from '../screens/AttendanceHistoryScreen';
import { AttendanceMarkedScreen } from '../screens/AttendanceMarkedScreen';
import { GuardProfileScreen } from '../screens/GuardProfileScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { IncomingReliefRequestsScreen } from '../screens/IncomingReliefRequestsScreen';
import { LeaveTimeOffScreen } from '../screens/LeaveTimeOffScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { MainTabPlaceholderScreen } from '../screens/MainTabPlaceholderScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { PatrolSessionScreen } from '../screens/PatrolSessionScreen';
import { RelieveAGuardScreen } from '../screens/RelieveAGuardScreen';
import { ShiftDetailsScreen } from '../screens/ShiftDetailsScreen';
import { UpcomingScheduleScreen } from '../screens/UpcomingScheduleScreen';
import { useGuardAppNavigation } from './useGuardAppNavigation';

export function GuardAppRoot() {
  const { isAuthenticated, stackRoute, mainTab } = useGuardAppNavigation();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  let screen = <HomeScreen />;

  if (stackRoute === 'patrolSession') {
    screen = <PatrolSessionScreen />;
  } else if (stackRoute === 'attendanceMarked') {
    screen = <AttendanceMarkedScreen />;
  } else if (stackRoute === 'shiftDetails') {
    screen = <ShiftDetailsScreen />;
  } else if (stackRoute === 'applyForLeave') {
    screen = <ApplyForLeaveScreen />;
  } else if (stackRoute === 'leaveTimeOff') {
    screen = <LeaveTimeOffScreen />;
  } else if (stackRoute === 'relieveAGuard') {
    screen = <RelieveAGuardScreen />;
  } else if (stackRoute === 'incomingReliefRequests') {
    screen = <IncomingReliefRequestsScreen />;
  } else if (stackRoute === 'guardProfile') {
    screen = <GuardProfileScreen />;
  } else if (stackRoute === 'notifications') {
    screen = <NotificationsScreen />;
  } else if (mainTab === 'schedule') {
    screen = <UpcomingScheduleScreen />;
  } else if (mainTab === 'attendance') {
    screen = <AttendanceHistoryScreen />;
  } else if (mainTab === 'more') {
    screen = (
      <MainTabPlaceholderScreen
        screenTitle="More"
        activeTab="more"
        message="Additional guard tools and settings will appear here."
      />
    );
  }

  return (
    <Fragment>
      <StatusBar style="dark" />
      {screen}
    </Fragment>
  );
}
