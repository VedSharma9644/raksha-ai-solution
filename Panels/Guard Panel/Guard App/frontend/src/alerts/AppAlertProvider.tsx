import { MaterialIcons } from '@expo/vector-icons';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { appAlertStyles as styles } from '../styles/app-alert.styles';
import { appColors } from '../theme';
import { registerAppAlertHandler, showAlert } from './appAlert';
import type {
  AppAlertButton,
  AppAlertOptions,
  AppAlertRequest,
  AppAlertTone,
} from './appAlertTypes';

type AppAlertContextValue = {
  alert: typeof showAlert;
};

const AppAlertContext = createContext<AppAlertContextValue | null>(null);

function detectTone(title: string, buttons: AppAlertButton[]): AppAlertTone {
  const t = title.toLowerCase();
  if (
    t.includes('emergency') ||
    t.includes('sos') ||
    buttons.some((b) => b.style === 'destructive' && /call|sos|end/i.test(b.text ?? ''))
  ) {
    return 'emergency';
  }
  if (
    t.includes('fail') ||
    t.includes('error') ||
    t.includes('closed') ||
    t.includes('locked') ||
    buttons.some((b) => b.style === 'destructive')
  ) {
    return 'warning';
  }
  if (
    t.includes('sent') ||
    t.includes('submitted') ||
    t.includes('withdrawn') ||
    t.includes('verified') ||
    t.includes('success')
  ) {
    return 'success';
  }
  return 'info';
}

function toneIcon(tone: AppAlertTone): keyof typeof MaterialIcons.glyphMap {
  switch (tone) {
    case 'emergency':
      return 'emergency';
    case 'warning':
      return 'warning-amber';
    case 'success':
      return 'check-circle';
    default:
      return 'info';
  }
}

function toneIconColor(tone: AppAlertTone): string {
  switch (tone) {
    case 'emergency':
      return appColors.onTertiaryFixed;
    case 'warning':
      return appColors.onErrorContainer;
    case 'success':
      return '#064e3b';
    default:
      return appColors.primary;
  }
}

function toneIconWrap(tone: AppAlertTone) {
  switch (tone) {
    case 'emergency':
      return styles.iconEmergency;
    case 'warning':
      return styles.iconWarning;
    case 'success':
      return styles.iconSuccess;
    default:
      return styles.iconInfo;
  }
}

function normalizeButtons(buttons?: AppAlertButton[]): AppAlertButton[] {
  if (!buttons || buttons.length === 0) {
    return [{ text: 'OK', style: 'default' }];
  }
  return buttons.map((button) => ({
    text: button.text?.trim() || 'OK',
    style: button.style ?? 'default',
    onPress: button.onPress,
  }));
}

export function AppAlertProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<AppAlertRequest | null>(null);

  const present = useCallback((next: AppAlertRequest) => {
    setRequest(next);
  }, []);

  useEffect(() => {
    registerAppAlertHandler(present);
    return () => registerAppAlertHandler(null);
  }, [present]);

  const dismiss = useCallback(() => {
    setRequest(null);
  }, []);

  const buttons = normalizeButtons(request?.buttons);
  const tone =
    request?.options?.tone ??
    (request ? detectTone(request.title, buttons) : 'info');
  const stacked = buttons.length > 2;
  const cancelable = request?.options?.cancelable !== false;

  const onRequestClose = useCallback(() => {
    if (!cancelable) {
      return;
    }
    const cancelBtn = buttons.find((b) => b.style === 'cancel');
    dismiss();
    cancelBtn?.onPress?.();
  }, [buttons, cancelable, dismiss]);

  const value = useMemo(() => ({ alert: showAlert }), []);

  return (
    <AppAlertContext.Provider value={value}>
      {children}
      <Modal
        visible={Boolean(request)}
        transparent
        animationType="fade"
        onRequestClose={onRequestClose}
        statusBarTranslucent
      >
        <Pressable style={styles.backdrop} onPress={onRequestClose}>
          <Pressable
            style={styles.card}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={[styles.iconWrap, toneIconWrap(tone)]}>
              <MaterialIcons
                name={toneIcon(tone)}
                size={28}
                color={toneIconColor(tone)}
              />
            </View>
            <View>
              <Text style={styles.title}>{request?.title}</Text>
              {request?.message ? (
                <Text style={styles.message}>{request.message}</Text>
              ) : null}
            </View>
            <View style={[styles.actions, stacked && styles.actionsStacked]}>
              {buttons.map((button, index) => {
                const styleKey = button.style ?? 'default';
                return (
                  <Pressable
                    key={`${button.text}-${index}`}
                    style={({ pressed }) => [
                      styles.button,
                      stacked && styles.buttonStacked,
                      styleKey === 'cancel' && styles.buttonCancel,
                      styleKey === 'destructive' && styles.buttonDestructive,
                      styleKey === 'default' && styles.buttonDefault,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => {
                      dismiss();
                      button.onPress?.();
                    }}
                  >
                    <Text
                      style={
                        styleKey === 'cancel'
                          ? styles.labelCancel
                          : styleKey === 'destructive'
                            ? styles.labelDestructive
                            : styles.labelDefault
                      }
                    >
                      {button.text}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </AppAlertContext.Provider>
  );
}

export function useAppAlert(): AppAlertContextValue {
  const ctx = useContext(AppAlertContext);
  if (!ctx) {
    return { alert: showAlert };
  }
  return ctx;
}

export type { AppAlertButton, AppAlertOptions };
