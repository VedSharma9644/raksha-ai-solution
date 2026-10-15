import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ConfirmDialog,
  type ConfirmDialogTone,
} from "./ConfirmDialog";

export type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmDialogTone;
};

export type AlertOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  tone?: ConfirmDialogTone;
};

type PendingDialog =
  | ({
      kind: "confirm";
      resolve: (value: boolean) => void;
    } & ConfirmOptions)
  | ({
      kind: "alert";
      resolve: () => void;
    } & AlertOptions);

type ConfirmDialogContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions | string) => Promise<void>;
};

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(
  null
);

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingDialog | null>(null);
  const pendingRef = useRef<PendingDialog | null>(null);
  pendingRef.current = pending;

  const closeWith = useCallback((accepted: boolean) => {
    const current = pendingRef.current;
    if (!current) return;
    setPending(null);
    if (current.kind === "confirm") {
      current.resolve(accepted);
    } else {
      current.resolve();
    }
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ kind: "confirm", resolve, ...options });
    });
  }, []);

  const alertFn = useCallback((options: AlertOptions | string) => {
    const normalized: AlertOptions =
      typeof options === "string" ? { message: options } : options;
    return new Promise<void>((resolve) => {
      setPending({
        kind: "alert",
        resolve,
        title: normalized.title ?? "Notice",
        message: normalized.message,
        confirmLabel: normalized.confirmLabel ?? "OK",
        tone: normalized.tone,
      });
    });
  }, []);

  const value = useMemo(
    () => ({ confirm, alert: alertFn }),
    [confirm, alertFn]
  );

  return (
    <ConfirmDialogContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={pending != null}
        title={pending?.title ?? ""}
        message={pending?.message ?? ""}
        confirmLabel={
          pending?.kind === "alert"
            ? (pending.confirmLabel ?? "OK")
            : (pending?.confirmLabel ?? "Confirm")
        }
        cancelLabel={
          pending?.kind === "confirm"
            ? (pending.cancelLabel ?? "Cancel")
            : "Cancel"
        }
        tone={pending?.tone ?? "default"}
        alertOnly={pending?.kind === "alert"}
        onConfirm={() => closeWith(true)}
        onCancel={() => closeWith(false)}
      />
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog(): ConfirmDialogContextValue {
  const ctx = useContext(ConfirmDialogContext);
  if (!ctx) {
    throw new Error(
      "useConfirmDialog must be used inside <ConfirmDialogProvider>"
    );
  }
  return ctx;
}
