import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

/**
 * Runs `callback` on an interval only while the app is in the foreground.
 * Pauses when backgrounded / inactive; invokes once immediately on resume.
 */
export function useForegroundInterval(
  callback: () => void,
  intervalMs: number,
  enabled = true,
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled || intervalMs <= 0) {
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const stop = () => {
      if (intervalId != null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const start = () => {
      stop();
      intervalId = setInterval(() => {
        callbackRef.current();
      }, intervalMs);
    };

    if (AppState.currentState === 'active') {
      start();
    }

    const onState = (next: AppStateStatus) => {
      if (next === 'active') {
        callbackRef.current();
        start();
        return;
      }
      // inactive (iOS multitasking) + background — no network polls in pocket
      stop();
    };

    const sub = AppState.addEventListener('change', onState);
    return () => {
      stop();
      sub.remove();
    };
  }, [enabled, intervalMs]);
}
