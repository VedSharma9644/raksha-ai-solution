import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';

import type { GuardSessionUser, PunchInResult } from '../api/guard-api';
import type { BottomTabKey } from '../constants/bottom-tab-menu-items';
import type { GuardMainTab, GuardStackRoute } from './guard-app-routes';

type GuardAppNavigationContextValue = {
  isAuthenticated: boolean;
  authToken: string | null;
  guardUser: GuardSessionUser | null;
  cameraUnlocked: boolean;
  lastKnownLocation: { lat: number; lng: number; accuracyMeters: number } | null;
  lastPunchResult: PunchInResult | null;
  mainTab: GuardMainTab;
  stackRoute: GuardStackRoute | null;
  setMainTab: (tab: BottomTabKey) => void;
  openPatrolSession: () => void;
  openAttendanceMarked: (result?: PunchInResult) => void;
  openShiftDetails: () => void;
  openApplyForLeave: () => void;
  openLeaveTimeOff: () => void;
  openRelieveAGuard: () => void;
  openIncomingReliefRequests: () => void;
  openGuardProfile: () => void;
  setCameraUnlocked: (unlocked: boolean) => void;
  setLastKnownLocation: (location: {
    lat: number;
    lng: number;
    accuracyMeters: number;
  } | null) => void;
  signIn: (token: string, guard: GuardSessionUser) => void;
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
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [guardUser, setGuardUser] = useState<GuardSessionUser | null>(null);
  const [cameraUnlocked, setCameraUnlockedState] = useState(false);
  const [lastKnownLocation, setLastKnownLocationState] = useState<{
    lat: number;
    lng: number;
    accuracyMeters: number;
  } | null>(null);
  const [lastPunchResult, setLastPunchResult] = useState<PunchInResult | null>(null);
  const [mainTab, setMainTabState] = useState<GuardMainTab>('home');
  const [stackRoute, setStackRoute] = useState<GuardStackRoute | null>(null);

  const setMainTab = useCallback((tab: BottomTabKey) => {
    setMainTabState(tab);
    setStackRoute(null);
  }, []);

  const openPatrolSession = useCallback(() => {
    setStackRoute('patrolSession');
  }, []);

  const openAttendanceMarked = useCallback((result?: PunchInResult) => {
    if (result) {
      setLastPunchResult(result);
    }
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

  const setCameraUnlocked = useCallback((unlocked: boolean) => {
    setCameraUnlockedState(unlocked);
  }, []);

  const setLastKnownLocation = useCallback(
    (location: { lat: number; lng: number; accuracyMeters: number } | null) => {
      setLastKnownLocationState(location);
    },
    [],
  );

  const signIn = useCallback((token: string, guard: GuardSessionUser) => {
    setAuthToken(token);
    setGuardUser(guard);
    setIsAuthenticated(true);
    setCameraUnlockedState(false);
    setLastPunchResult(null);
    setStackRoute(null);
    setMainTabState('home');
  }, []);

  const signOut = useCallback(() => {
    setIsAuthenticated(false);
    setAuthToken(null);
    setGuardUser(null);
    setCameraUnlockedState(false);
    setLastKnownLocationState(null);
    setLastPunchResult(null);
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
      authToken,
      guardUser,
      cameraUnlocked,
      lastKnownLocation,
      lastPunchResult,
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
      setCameraUnlocked,
      setLastKnownLocation,
      signIn,
      signOut,
      goHome,
      goBack,
    }),
    [
      isAuthenticated,
      authToken,
      guardUser,
      cameraUnlocked,
      lastKnownLocation,
      lastPunchResult,
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
      setCameraUnlocked,
      setLastKnownLocation,
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
