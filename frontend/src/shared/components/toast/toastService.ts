export type ToastVariant = "info" | "success" | "error";

export type ToastPayload = {
  message: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

const toastEventTarget = new EventTarget();

export const toastService = {
  notify(payload: ToastPayload) {
    toastEventTarget.dispatchEvent(new CustomEvent("toast", { detail: payload }));
  },
};

export { toastEventTarget };
