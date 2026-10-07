import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';

import type { GuardSessionUser, PunchInResult } from '../api/guard-api';
import type { BottomTabKey } from '../constants/bottom-tab-menu-items';
import type { GuardMainTab, GuardStackRoute } from './guard-app-routes';

export type PatrolMode = 'punch_in' | 'punch_out';

type GuardAppNavigationContextValue = {
  isAuthenticated: boolean;
  authToken: string | null;
  guardUser: GuardSessionUser | null;
  cameraUnlocked: boolean;
  patrolMode: PatrolMode;
  shiftActive: boolean;
  lastKnownLocation: { lat: number; lng: number; accuracyMeters: number } | null;
  lastPunchResult: PunchInResult | null;
  mainTab: GuardMainTab;
  stackRoute: GuardStackRoute | null;
  setMainTab: (tab: BottomTabKey) => void;
  openPatrolSession: (mode?: PatrolMode) => void;
  openAttendanceMarked: (result?: PunchInResult) => void;
  openShiftDetails: () => void;
  openApplyForLeave: () => void;
  openLeaveTimeOff: () => void;
  openRelieveAGuard: () => void;
  openIncomingReliefRequests: () => void;
  openGuardProfile: () => void;
  setCameraUnlocked: (unlocked: boolean) => void;
  setShiftActive: (active: boolean) => void;
  setPatrolMode: (mode: PatrolMode) => void;
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
  const [patrolMode, setPatrolModeState] = useState<PatrolMode>('punch_in');
  const [shiftActive, setShiftActiveState] = useState(false);
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

  const openPatrolSession = useCallback((mode: PatrolMode = 'punch_in') => {
    setPatrolModeState(mode);
    setStackRoute('patrolSession');
  }, []);

  const openAttendanceMarked = useCallback((result?: PunchInResult) => {
    if (result) {
      setLastPunchResult(result);
      if (result.mode === 'punch_out' || result.shiftStatus === 'ended') {
        setShiftActiveState(false);
        setCameraUnlockedState(false);
      } else if (result.mode === 'punch_in' || result.shiftStatus === 'started') {
        setShiftActiveState(true);
        setCameraUnlockedState(false);
      }
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

  const setShiftActive = useCallback((active: boolean) => {
    setShiftActiveState(active);
  }, []);

  const setPatrolMode = useCallback((mode: PatrolMode) => {
    setPatrolModeState(mode);
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
    setPatrolModeState('punch_in');
    setShiftActiveState(false);
    setLastPunchResult(null);
    setStackRoute(null);
    setMainTabState('home');
  }, []);

  const signOut = useCallback(() => {
    setIsAuthenticated(false);
    setAuthToken(null);
    setGuardUser(null);
    setCameraUnlockedState(false);
    setPatrolModeState('punch_in');
    setShiftActiveState(false);
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
      patrolMode,
      shiftActive,
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
      setShiftActive,
      setPatrolMode,
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
      patrolMode,
      shiftActive,
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
      setShiftActive,
      setPatrolMode,
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
