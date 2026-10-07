import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';

import type { BottomTabKey } from '../constants/bottom-tab-menu-items';
import type { GuardMainTab, GuardStackRoute } from './guard-app-routes';

type GuardAppNavigationContextValue = {
  isAuthenticated: boolean;
  mainTab: GuardMainTab;
  stackRoute: GuardStackRoute | null;
  setMainTab: (tab: BottomTabKey) => void;
  openPatrolSession: () => void;
  openAttendanceMarked: () => void;
  openShiftDetails: () => void;
  openApplyForLeave: () => void;
  openLeaveTimeOff: () => void;
  openRelieveAGuard: () => void;
  openIncomingReliefRequests: () => void;
  openGuardProfile: () => void;
  signIn: () => void;
  signOut: () => void;
  goHome: () => void;
  goBack: () => void;
};

export const GuardAppNavigationContext = createContext<GuardAppNavigationContextValue | null>(
  null,
);

type GuardAppNavigationProviderProps = {
  children: ReactNode;
};

export function GuardAppNavigationProvider({ children }: GuardAppNavigationProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mainTab, setMainTabState] = useState<GuardMainTab>('home');
  const [stackRoute, setStackRoute] = useState<GuardStackRoute | null>(null);

  const setMainTab = useCallback((tab: BottomTabKey) => {
    setMainTabState(tab);
    setStackRoute(null);
  }, []);

  const openPatrolSession = useCallback(() => {
    setStackRoute('patrolSession');
  }, []);

  const openAttendanceMarked = useCallback(() => {
    setStackRoute('attendanceMarked');
  }, []);

  const openShiftDetails = useCallback(() => {
    setStackRoute('shiftDetails');
  }, []);

  const openApplyForLeave = useCallback(() => {
    setStackRoute('applyForLeave');
  }, []);

  const openLeaveTimeOff = useCallback(() => {
    setStackRoute('leaveTimeOff');
  }, []);

  const openRelieveAGuard = useCallback(() => {
    setStackRoute('relieveAGuard');
  }, []);

  const openIncomingReliefRequests = useCallback(() => {
    setStackRoute('incomingReliefRequests');
  }, []);

  const openGuardProfile = useCallback(() => {
    setStackRoute('guardProfile');
  }, []);

  const signIn = useCallback(() => {
    setIsAuthenticated(true);
    setStackRoute(null);
    setMainTabState('home');
  }, []);

  const signOut = useCallback(() => {
    setIsAuthenticated(false);
    setStackRoute(null);
    setMainTabState('home');
  }, []);

  const goHome = useCallback(() => {
    setStackRoute(null);
    setMainTabState('home');
  }, []);

  const goBack = useCallback(() => {
    setStackRoute(null);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      mainTab,
      stackRoute,
      setMainTab,
      openPatrolSession,
      openAttendanceMarked,
      openShiftDetails,
      openApplyForLeave,
      openLeaveTimeOff,
      openRelieveAGuard,
      openIncomingReliefRequests,
      openGuardProfile,
      signIn,
      signOut,
      goHome,
      goBack,
    }),
    [
      isAuthenticated,
      mainTab,
      stackRoute,
      setMainTab,
      openPatrolSession,
      openAttendanceMarked,
      openShiftDetails,
      openApplyForLeave,
      openLeaveTimeOff,
      openRelieveAGuard,
      openIncomingReliefRequests,
      openGuardProfile,
      signIn,
      signOut,
      goHome,
      goBack,
    ],
  );

  return (
    <GuardAppNavigationContext.Provider value={value}>{children}</GuardAppNavigationContext.Provider>
  );
}
