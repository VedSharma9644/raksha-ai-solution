import type { AppAlertButton, AppAlertOptions, AppAlertRequest } from './appAlertTypes';

type AlertHandler = (request: AppAlertRequest) => void;

let handler: AlertHandler | null = null;

/** Called by AppAlertProvider on mount/unmount. */
export function registerAppAlertHandler(next: AlertHandler | null): void {
  handler = next;
}

/**
 * Drop-in replacement for React Native `Alert.alert` with the app’s custom dialog.
 * Safe to call from any screen once AppAlertProvider is mounted.
 */
export function showAlert(
  title: string,
  message?: string,
  buttons?: AppAlertButton[],
  options?: AppAlertOptions,
): void {
  if (!handler) {
    // Provider not mounted yet — avoid crashing callers.
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[showAlert] AppAlertProvider is not mounted:', title, message);
    }
    return;
  }
  handler({ title, message, buttons, options });
}
