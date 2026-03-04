// utils/toast.ts — Lightweight toast notification utility (no external deps)
// Uses a custom event to allow toasts from anywhere in the app.

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms, default 4000
}

const TOAST_EVENT = 'ecotrade_toast';

function genId() {
  return `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function showToast(
  type: ToastType,
  title: string,
  message?: string,
  duration = 4000,
): void {
  const detail: ToastMessage = { id: genId(), type, title, message, duration };
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail }));
}

export const toast = {
  success: (title: string, message?: string) => showToast('success', title, message),
  error:   (title: string, message?: string) => showToast('error',   title, message),
  warning: (title: string, message?: string) => showToast('warning', title, message),
  info:    (title: string, message?: string) => showToast('info',    title, message),
};

export { TOAST_EVENT };
