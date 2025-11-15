import { useCallback, useEffect, useMemo, useState } from "react";

import { toastEventTarget, type ToastPayload, type ToastVariant } from "./toastService";

const getVariantStyles = (variant: ToastVariant) => {
  switch (variant) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "error":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-slate-200 bg-white text-slate-800";
  }
};

const DEFAULT_DURATION = 4000;

const ToastStack = () => {
  const [toasts, setToasts] = useState<(ToastPayload & { id: string })[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const payload = (event as CustomEvent<ToastPayload>).detail;
      const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      const toast = {
        id,
        message: payload.message,
        description: payload.description,
        variant: payload.variant ?? "info",
        duration: payload.duration ?? DEFAULT_DURATION,
      };
      setToasts((prev) => [...prev, toast]);
      window.setTimeout(() => removeToast(id), toast.duration);
    };

    toastEventTarget.addEventListener("toast", handler as EventListener);
    return () => {
      toastEventTarget.removeEventListener("toast", handler as EventListener);
    };
  }, [removeToast]);

  const stack = useMemo(
    () => [...toasts].reverse(),
    [toasts],
  );

  if (stack.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex flex-col gap-2">
      {stack.map((toast) => (
        <div
          key={toast.id}
          className={`max-w-sm rounded-2xl border px-4 py-3 shadow-lg transition-all duration-200 ${
            getVariantStyles(toast.variant ?? "info")
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold leading-snug">{toast.message}</p>
            <button
              type="button"
              className="text-xs font-bold text-current opacity-70 transition hover:opacity-100"
              onClick={() => removeToast(toast.id)}
            >
              ×
            </button>
          </div>
          {toast.description && <p className="mt-1 text-xs leading-snug text-current/80">{toast.description}</p>}
        </div>
      ))}
    </div>
  );
};

export const ToastRoot = () => <ToastStack />;
