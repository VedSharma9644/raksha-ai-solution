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

  const refresh = useCallback(
    async (opts?: { silent?: boolean; force?: boolean }) => {
      if (!authToken) {
        profileCache = null;
        setProfile(null);
        setError(null);
        notifyListeners();
        return;
      }

      const silent =
        opts?.silent === true &&
        Boolean(profileCache && profileCache.token === authToken);
      const fresh =
        !opts?.force &&
        profileCache &&
        profileCache.token === authToken &&
        Date.now() - profileCache.at < 30_000;
      if (fresh) {
        setProfile(profileCache!.data);
        return;
      }

      if (!silent) {
        setIsLoading(true);
        setError(null);
      }
      try {
        const data = await fetchGuardProfile(authToken);
        const prev = profileCache?.token === authToken ? profileCache.data : null;
        const changed =
          !prev ||
          prev.fullName !== data.fullName ||
          prev.profilePictureUrl !== data.profilePictureUrl ||
          prev.site.siteName !== data.site.siteName ||
          prev.site.postName !== data.site.postName ||
          prev.shiftFrom !== data.shiftFrom ||
          prev.shiftTo !== data.shiftTo ||
          JSON.stringify(prev.gear) !== JSON.stringify(data.gear);
        profileCache = { token: authToken, data, at: Date.now() };
        if (changed) {
          setProfile(data);
          notifyListeners();
        }
      } catch (err: unknown) {
        if (!silent) {
          setError(
            err instanceof Error ? err.message : 'Failed to load profile.',
          );
        }
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    [authToken],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    return subscribeRosterSync(() => {
      void refresh({ silent: true, force: true });
    });
  }, [refresh]);

  useEffect(() => {
    const onState = (state: AppStateStatus) => {
      if (state === 'active') {
        void refresh({ silent: true, force: true });
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
    refresh: () => refresh({ silent: false, force: true }),
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
