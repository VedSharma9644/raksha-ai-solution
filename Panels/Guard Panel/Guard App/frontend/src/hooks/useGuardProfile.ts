import { useCallback, useEffect, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import {
  fetchGuardProfile,
  type GuardProfileResponse,
} from '../api/guard-api';
import { useGuardAppNavigation } from '../navigation/useGuardAppNavigation';
import { subscribeRosterSync } from '../sync/rosterSync';

type CacheEntry = {
  token: string;
  data: GuardProfileResponse;
  at: number;
};

let profileCache: CacheEntry | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function useGuardProfile(): {
  profile: GuardProfileResponse | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const { authToken } = useGuardAppNavigation();
  const [profile, setProfile] = useState<GuardProfileResponse | null>(() =>
    profileCache && profileCache.token === authToken ? profileCache.data : null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, bump] = useState(0);

  useEffect(() => {
    const listener = () => bump((value) => value + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (profileCache && profileCache.token === authToken) {
      setProfile(profileCache.data);
    } else if (!authToken) {
      setProfile(null);
    }
  }, [authToken]);

  const refresh = useCallback(async () => {
    if (!authToken) {
      profileCache = null;
      setProfile(null);
      setError(null);
      notifyListeners();
      return;
    }

    const fresh =
      profileCache &&
      profileCache.token === authToken &&
      Date.now() - profileCache.at < 30_000;
    if (fresh) {
      setProfile(profileCache!.data);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchGuardProfile(authToken);
      profileCache = { token: authToken, data, at: Date.now() };
      setProfile(data);
      notifyListeners();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to load profile.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    return subscribeRosterSync(() => {
      profileCache = null;
      void refresh();
    });
  }, [refresh]);

  useEffect(() => {
    const onState = (state: AppStateStatus) => {
      if (state === 'active') {
        profileCache = null;
        void refresh();
      }
    };
    const sub = AppState.addEventListener('change', onState);
    return () => {
      sub.remove();
    };
  }, [refresh]);

  return {
    profile:
      profileCache && profileCache.token === authToken
        ? profileCache.data
        : profile,
    isLoading,
    error,
    refresh,
  };
}

export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return phone.trim() || '—';
}

export function toTelHref(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) {
    return null;
  }
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  return digits.startsWith('+') ? digits : `+${digits}`;
}
