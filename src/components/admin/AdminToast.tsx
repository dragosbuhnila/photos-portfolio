'use client';

import React, { useEffect } from 'react';

export interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AdminToastProps {
  toast: ToastState | null;
  onClose: () => void;
  duration?: number;
}

export default function AdminToast({
  toast,
  onClose,
  duration = 3500,
}: AdminToastProps) {
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [toast, onClose, duration]);

  if (!toast) return null;

  const borderColor =
    toast.type === 'error'
      ? 'border-red-800/80'
      : toast.type === 'success'
      ? 'border-emerald-700/80'
      : 'border-neutral-700';

  const textColor =
    toast.type === 'error'
      ? 'text-red-300'
      : toast.type === 'success'
      ? 'text-emerald-300'
      : 'text-text-bright';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-fade-in">
      <div
        className={`bg-neutral-900 border ${borderColor} px-4 py-3 flex items-center justify-between gap-4`}
      >
        <p className={`text-xs tracking-wide uppercase ${textColor}`}>
          {toast.message}
        </p>
        <button
          onClick={onClose}
          className="text-neutral-500 hover:text-text-bright text-sm transition-colors"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
