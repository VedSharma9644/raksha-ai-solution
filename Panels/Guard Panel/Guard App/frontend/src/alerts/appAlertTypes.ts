export type AppAlertButtonStyle = 'default' | 'cancel' | 'destructive';

export type AppAlertButton = {
  text?: string;
  style?: AppAlertButtonStyle;
  onPress?: () => void;
};

export type AppAlertTone = 'info' | 'warning' | 'success' | 'emergency';

export type AppAlertOptions = {
  cancelable?: boolean;
  /** Override auto-detected tone from title/buttons. */
  tone?: AppAlertTone;
};

export type AppAlertRequest = {
  title: string;
  message?: string;
  buttons?: AppAlertButton[];
  options?: AppAlertOptions;
};
